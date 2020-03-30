// Alfredo Osuna Torres A01339250

let container;
let camera, scene, raycaster, renderer;
let counter;
let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
let radius = 100, theta = 0;
let objectDestroy = 0;
let floorUrl = "../images/checker_large.gif";
let objModelUrl = {obj:'/box-by-Algorythm/box.obj', map:'/box-by-Algorythm/Metal_Plate_011_basecolor.jpg'};

let initAnim = true;
let runAnim = false;
let isPlay = false;
let timeleft = 59;
let downloadTimer;

let startButton;
let resetButton;



function StartAnimation() {
    if (initAnim) {
     
        initAnim = false;
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
    for ( i = 0 ; i<10 ; i++){
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

    let material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('../textures/side.png')
     });
    let geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
    
    for (  counter = 0; counter < 10; counter ++ ) 
    {
        let object = new THREE.Mesh( geometry, material );
        
        object.name = 'Cube' + counter;
        object.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -200);
        scene.add( object );
    }
    
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

function createObject(){
    
    if(scene.children.length<=11){
        

        let material = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('../textures/side.png')
         });
        
        document.getElementById ("contador").innerHTML = objectDestroy;
        let geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );

        
        
        let object = new THREE.Mesh( geometry, material );
        
        counter+=1;    
        object.name = 'Cube' + counter;
        object.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -200);
        
        scene.add( object );
    }

    
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( scene.children );
    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ intersects.length - 1 ].object;
        scene.remove(scene.getObjectByName(CLICKED.name));
        objectDestroy+=1;
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
                scene.remove(scene.getObjectByName(obj.name));
                objectDestroy-=1;
                createObject();
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