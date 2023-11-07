import * as THREE from 'three';
import { DRACOLoader } from 'DRACOLoader';
import { GLTFLoader } from 'GLTFLoader';
import { OBJLoader } from 'OBJLoader';
import { MTLLoader } from 'MTLLoader';

import { XYZLoader}   from 'XYZLoader';
import {
	BufferGeometry,
	FileLoader,
	Float32BufferAttribute,
	Loader
} from 'three';
import {OrbitControls} from '../lib/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera( 640 / - 2, 640 / 2, 480 / 2, 480 / - 2, -1000, 1000 );
const controls =new OrbitControls(camera, renderer.domElement);




var numOfPts=0;

//var normVector;




function main()
{
    //Scene (as globle var)
    //document.querySelector('canvas').remove();

    renderer.setClearColor(0x888888,1);
    renderer.setSize(640,480);
    document.body.appendChild(renderer.domElement);
    camera.position.set(0,0,5);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( './lib/jsm/libs/draco/' );
    
    var loader = new GLTFLoader() 
    loader.setDRACOLoader( dracoLoader );
    
    loader.load('./MarioKartStadium.glb', function(glb) {
       var mesh = glb.scene 
       
       mesh.scale.setScalar( 1.0 );
       mesh.name = 'MyGLTF'
       scene.add(mesh)
       mesh.position.setZ(-5);
       mesh.position.setX(0);

    });
    //camera (as globle var)
    //Mesh (still local var, we will retrive it by getObjectByName)
    new MTLLoader()
                    .load( './TaxiCar.mtl', function ( materials ) {

						materials.preload();
                        
						new OBJLoader()
							.setMaterials( materials )
							.load( './TaxiCar.obj', function ( object ) {
                                object.name = 'MyOBJ';
                                //enlarge the object
								object.scale.setScalar( 0.7 );
               // object.rotateZ(180*Math.PI/180);
								scene.add( object );

							} );

	} );
    const loader1 = new XYZLoader();
    loader1.load( './TrackCenter.xyz', function ( geometry ) {

        //geometry.center();
        const vertexColors = ( geometry.hasAttribute( 'color' ) === false );

        const material = new THREE.PointsMaterial( { size: 0, vertexColors: vertexColors } );
             
        var points = new THREE.Points( geometry, material );
        points.name='Tracker';

        const curve = new THREE.CatmullRomCurve3( points);
       
        const materialLine = new THREE.LineBasicMaterial( { color: 0xff0000 } );
 
        // Create the final object to add to the scene
        const curveObject = new THREE.Line( geometry, materialLine );
        curveObject.name='Path';
        scene.add(curveObject);
        scene.add( points );
        numOfPts=points.geometry.attributes.position.count;
        
        
        
       // console.log(points);
    } );

    var loader_txt = new THREE.FileLoader();
    loader_txt.load( "./Normal1.txt", function ( data ) {

       const lines=data.split('\n');
     

       const vertices=[];
       for (let line of lines)
       {
            line=line.trim();
            const lineValues=line.split(/\s+/);
            //console.log(lineValues.length);
            if(lineValues.length===3)
            {
                vertices.push(parseFloat(lineValues[0]));
                vertices.push(parseFloat(lineValues[1]));
                vertices.push(parseFloat(lineValues[2]));
                

               // console.log(vertices);
            }
       }
       const geometry = new BufferGeometry();
       geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
       //return geometry;
       const material = new THREE.PointsMaterial( { color: 0x888888  } );

       var normalPts = new THREE.Points( geometry, material );
       const curveNormal = new THREE.CatmullRomCurve3( normalPts);
       const materialLine = new THREE.LineBasicMaterial( { color: 0xff0000 } );
       const lineObject = new THREE.Line( geometry, materialLine );
       lineObject.name='NormalPath';
       scene.add(lineObject);
       normalPts.name='normalVec';
       scene.add(normalPts)

       //console.log(normalPts);
    } );
    
    //
    var axisHelper = new THREE.AxesHelper(100);

    var light = new THREE.PointLight( 0xffffff, 10, 10000, 0.1)
    light.position.set(100, -100, 500)

    const lighthelper = new THREE.PointLightHelper(light) 
    
    scene.add(camera);
    scene.add(axisHelper);
    scene.add(light)
    scene.add(lighthelper)


    //Render (as globle var)
   

   

    //orbit.update;
    animateFrame();
       //z render.render(scene,camera);

}

 
var j=3;
var i=0;
const offset=7.0;

function animateFrame()
{
    //Get the object from scene
    var meshCar = scene.getObjectByName('MyOBJ',true)
    var Track = scene.getObjectByName('Tracker',true)
    var normalVecs = scene.getObjectByName('normalVec',true)
    var normalLine=scene.getObjectByName('NormalPath',true);
    var runningPath = scene.getObjectByName('Path',true)
    //console.log(normalVecs);
     
    if(meshCar && Track && normalVecs && runningPath &&normalLine){
      
     
        var dx=Track.geometry.attributes.position.array[j]-Track.geometry.attributes.position.array[i];

        var dy=Track.geometry.attributes.position.array[j+1]-Track.geometry.attributes.position.array[i+1];

        var dz=Track.geometry.attributes.position.array[j+2]-Track.geometry.attributes.position.array[i+2];

        var normalX=normalVecs.geometry.attributes.position.array[i];
        var normalY=normalVecs.geometry.attributes.position.array[i+1];
        var normalZ=normalVecs.geometry.attributes.position.array[i+2];
        
        const T12=new THREE.Vector3(dx,dy,dz);
        var normVector=new THREE.Vector3(normalX,normalY,normalZ);
        var tangent=T12.normalize();
        //var tangent=runningPath.getTangent(fraction).normalize();
        //var normVector=normalLine.getPoint(fraction);
        normVector.normalize();
      
        //quaternion///////////////////////////////////////////////////////
        var up=new THREE.Vector3(0,1,0);
        //var upp=new THREE.Vector3();
        //upp.crossVectors(tangent,normVector).normalize();
        //console.log(upp);
        var axis=new THREE.Vector3();
         axis.crossVectors(up,tangent).normalize();

        var radians=Math.acos(up.dot(tangent));

        if(radians>Math.PI-0.2)
        {
            radians-=Math.PI;
        }
       
        //meshCar.quaternion.setFromAxisAngle(axis,radians);
        //meshCar.quaternion.setFromUnitVectors(up,tangent);
        //var focalPoint=new THREE.Vector3(meshCar.position.x+normVector.x,meshCar.position.y+normVector.y,meshCar.position.z+normVector.z);
        //meshCar.up=new THREE.Vector3(up);
        //meshCar.lookAt(focalPoint);
 
        //Up.crossVectors(tangent,normVector).normalize();
         var radians=normVector.angleTo(tangent);
         
         
         //Tangent.normalize();

         if((Math.PI/2-radians)>0.05)
         {
          
          console.log(tangent);
          console.log(i/3);

          console.log(radians*180/Math.PI);
          
          
         }
         var Up=new THREE.Vector3();

         //if (i>420*3 & i<460*3)
         //{
         //     Up=new THREE.Vector3(0,1,0);
         //     tangent.crossVectors(Up,normVector).normalize();  

         //}
         //else
         //{
           Up.crossVectors(normVector,tangent).normalize();  

         //}
         tangent.crossVectors(normVector,Up).normalize();  
         //Up.crossVectors(normVector,tangent).normalize(); 
         const rm = new THREE.Matrix4().makeBasis(Up,tangent, normVector);
        // meshCar.applyMatrix4(rm);
        
        
           if (i===0)
            {
             
            // meshCar.applyMatrix4(rm);
           
             meshCar.position.x=Track.geometry.attributes.position.array[i]+offset*Up.x;
             //meshCar.position.x=meshCar.position.x;
             meshCar.position.y=Track.geometry.attributes.position.array[i+1]+offset*Up.y;
             meshCar.position.z=Track.geometry.attributes.position.array[i+2]+offset*Up.z;
             //meshCar.position.copy(runningPath.getPoint(fraction));
           
             
           }
          if(i>=3)
          {
            var k=i-3;
            //console.log(i);
            var dxx=Track.geometry.attributes.position.array[i]-Track.geometry.attributes.position.array[k];
            var dyy=Track.geometry.attributes.position.array[i+1]-Track.geometry.attributes.position.array[k+1];
            var dzz=Track.geometry.attributes.position.array[i+2]-Track.geometry.attributes.position.array[k+2];

            var normalXX=normalVecs.geometry.attributes.position.array[k];
            var normalYY=normalVecs.geometry.attributes.position.array[k+1];
            var normalZZ=normalVecs.geometry.attributes.position.array[k+2];
            var T11=new THREE.Vector3(dxx,dyy,dzz);
            var normalVector=new THREE.Vector3(normalXX,normalYY,normalZZ);
            
            normalVector.normalize();
            var tangent11=new THREE.Vector3();;
            var radians=normalVector.angleTo(tangent11);
            var Upp=new THREE.Vector3();

           
                 tangent11=T11.normalize();
                 Upp.crossVectors(normalVector,tangent11).normalize();
                 tangent11.crossVectors(normalVector,Upp).normalize();
                 //Upp.crossVectors(normalVector,tangent11).normalize();


            
           
           // normalVector.normalize();
            //Upp.crossVectors(tangent11,normalVector).normalize();

            var rm_prev = new THREE.Matrix4().makeBasis(Upp,tangent11,normalVector);
            var rm_inv=rm_prev.clone();
            rm_inv.invert();

            var dxx=Track.geometry.attributes.position.array[i]-Track.geometry.attributes.position.array[k];
            var dyy=Track.geometry.attributes.position.array[i+1]-Track.geometry.attributes.position.array[k+1];
            var dzz=Track.geometry.attributes.position.array[i+2]-Track.geometry.attributes.position.array[k+2];
            var T12_mat=new THREE.Matrix4().makeTranslation(dxx,dyy,dzz);

            // console.log(k);
            var Tx=Track.geometry.attributes.position.array[k]+offset*Upp.x;
            var Ty=Track.geometry.attributes.position.array[k+1]+offset*Upp.y;
            var Tz=Track.geometry.attributes.position.array[k+2]+offset*Upp.z;
            var T1_mat=new THREE.Matrix4().makeTranslation(Tx,Ty,Tz);
            var T1_mat_inv=T1_mat.clone();
            T1_mat_inv.invert();

            meshCar.applyMatrix4(T1_mat_inv);
            meshCar.applyMatrix4(rm_inv);
            meshCar.applyMatrix4(rm);
            meshCar.applyMatrix4(T1_mat);
            meshCar.applyMatrix4(T12_mat); 
           
           
          }
            
            //meshCar.position.x=Track.geometry.attributes.position.array[i];
           // meshCar.position.x=meshCar.position.x;
           // meshCar.position.y=Track.geometry.attributes.position.array[i+1];
           // meshCar.position.z=Track.geometry.attributes.position.array[i+2];
          

           /*   meshCar.position.x=Track.geometry.attributes.position.array[i];
             meshCar.position.x=meshCar.position.x;
             meshCar.position.y=Track.geometry.attributes.position.array[i+1];
             meshCar.position.z=Track.geometry.attributes.position.array[i+2]; */
          
          i+=3;
          j=i+3;
          
            if(j>(numOfPts-1)*3)
            {
                j=0;
            }
            if(i>(numOfPts-1)*3)
            {
                i=0;
                j=3;
                
            } 
           
            //console.log(numOfPts);
            //console.log(j);
            //console.log(numOfPts*3 );


     }
    
   // console.log(geometry.attributes.color.array[0]);
    
   renderer.render(scene,camera);
    
    requestAnimationFrame(animateFrame)
}

main();