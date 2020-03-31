// Alfredo Osuna Torres A01339250

let container;
let camera, scene, raycaster, renderer;
let counter = 0;
let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
let radius = 100, theta = 0;
let objectDestroy = 0;
let floorUrl = "../images/checker_large.gif";
let objModelUrl = {obj:'../wooden _crate/wooden _crate.obj', map:'../wooden _crate/Textures/1024/Wooden Crate_Crate_BaseColor.png'};

let initAnim = true;
let runAnim = false;
let isPlay = false;
let timeleft = 59;
let downloadTimer;

let startButton;
let resetButton;

function promisifyLoader ( loader, onProgress ) 
{
    function promiseLoader ( url ) {
  
      return new Promise( ( resolve, reject ) => {
  
        loader.load( url, resolve, onProgress, reject );
  
      } );
    }
  
    return {
      originalLoader: loader,
      load: promiseLoader,
    };
}

function StartAnimation() {
    if (initAnim) {
     
        runAnim = true;
        theta = 0;
        document.addEventListener('mousedown', onDocumentMouseDown);
        
        
    }
    // Start and Pause 
    if (runAnim) {
        isPlay= true;
        runAnim = false;
        render();
        downloadTimer = setInterval(function(){
            if(timeleft <= 0){
                clearInterval(downloadTimer);
                document.getElementById("tiempo").innerHTML = "Finished";
                isPlay= false;

            } else {
                document.getElementById("tiempo").innerHTML = timeleft + " segundos";
            }
            timeleft -= 1;
            }, 1000);
    } 
    else {
        downloadTimer = 0;
        document.getElementById("startButtonId").innerHTML = 'Start';
        isPlay= false;
        runAnim = true;
    }
}


 function ResetParameters() {
    counter = 0;
    timeleft = 59;
    initAnim = true;
    document.getElementById("startButtonId").innerHTML = 'Start';
    document.getElementById("tiempo").innerHTML = "60 segundos";
    isPlay= false;
    runAnim = false;
    scene.children.forEach(obj =>{   
        let name = obj.name;
        if(name.charAt(0) == "C"){
            obj.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -200, -200);
        }
    });
    for ( counter = 0 ; counter<10 ; counter++){
        createObject();
    }    
    objectDestroy = 0;
    downloadTimer = 0;
    document.getElementById ("contador").innerHTML = objectDestroy;

}

function createScene(canvas) 
{
    

    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    
    let light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 );
    light.name = "light";
    scene.add( light );
    
    // floor

    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    let floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    scene.add( floor );


    
    for (  counter = 0; counter < 10; counter ++ ) 
    {
        createObject()
    }
    objectDestroy=0;
    document.getElementById ("contador").innerHTML = objectDestroy;

    raycaster = new THREE.Raycaster();
        
    
    document.getElementById("startButtonId").addEventListener("click", StartAnimation);
    document.getElementById("resetButtonId").addEventListener("click", ResetParameters);
    window.addEventListener( 'resize', onWindowResize);

    
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

async function createObject(){
    if(scene.children.length<=11){
        objectDestroy+=1;
        document.getElementById ("contador").innerHTML = objectDestroy;
        const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

        try {
            const object = await objPromiseLoader.load(objModelUrl.obj);
            
            let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
            

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.userData.parent = object
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    
                }
            });

            object.scale.set(4, 4, 4);
            object.name = 'Cube' + counter;
            object.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -200);
            scene.add(object);

        }
        catch (err) {
            return onError(err);
        }

    }

    
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( scene.children, true );
    if ( intersects.length > 0 ) 
    {
        
        CLICKED = intersects[ intersects.length - 1 ].object;
        console.log(CLICKED.userData.parent.name)
        if(CLICKED.name.charAt(0)=="C"){
            objectDestroy+=1;
            document.getElementById ("contador").innerHTML = objectDestroy;
            CLICKED.userData.parent.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -200);

        }
        createObject();
        
    } 
    
}

function moveObjects(){
    
    scene.children.forEach(obj => {
        let name = obj.name;
        if(name.charAt(0) == "C"){
            let dx = obj.position.x - camera.position.x;
            let dy = obj.position.y - camera.position.y;
            let dz = obj.position.z - camera.position.z;
            //Object moves X axes 
            if (obj.position.x > camera.position.x) {
                obj.position.x -= Math.min( 0.05, dx );    
            }
            else if(obj.position.x < camera.position.x){
                obj.position.x += Math.max( 0.05, dx );
            }
            //Object moves Y axes 
            if (obj.position.y > camera.position.y) {
                obj.position.y -= Math.min( 0.05, dy );
            }
            else if(obj.position.y < camera.position.y){
                obj.position.y += Math.max( 0.05, dy );
            }
            //Object moves Z axes  
            if(obj.position.z < camera.position.z){
                obj.position.z += Math.max( 0.1, dz );
            }
            if(obj.position.z > -100 ){
                console.log(obj.name);
                obj.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -200);
                objectDestroy-=1;
                document.getElementById ("contador").innerHTML = objectDestroy;
            }
        }
});
}

function run() 
{
    render();
    requestAnimationFrame(run);
    if(isPlay){
        moveObjects();
       
    } 
    else{
        document.removeEventListener('mousedown', onDocumentMouseDown);
        document.getElementById("startButtonId").innerHTML = 'Start';
        isPlay= false;
        runAnim = true;
    }
}

function render() 
{ 
    renderer.render( scene, camera );
}