// 1. Enable shadow mapping in the renderer.
// 2. Enable shadows and set shadow parameters for the lights that cast shadows.
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows.
// 3. Indicate which geometry objects cast and receive shadows.

let renderer = null,
scene = null,
camera = null,
root = null,
group = null,
objectList = [],
orbitControls = null;
transFormControls = null;
mesh = null;

let objLoader = null;

let duration = 20000; // ms
let currentTime = Date.now();

//Scene Lights
let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let pointLight = null;

let mapUrl = "../images/floor15.jpg";

let SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

//Scene Objects
let objModelUrl = {obj:'../models/obj/human/FinalBaseMesh.obj', map:'../models/obj/human/gray.png'};

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

const onError = ( ( err ) => { console.error( err ); } );


async function loadObj(objModelUrl, objectList)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        const object = await objPromiseLoader.load(objModelUrl.obj);
        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;

        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture
            }
        });

        //object.scale.set(3, 3, 3);
        object.position.z = 0;
        object.position.x = 0;
        object.rotation.y = 0;
        object.name = "objObject";
        objectList.push(object);
        scene.add(object);

    }
    catch (err) {
        return onError(err);
    }
}

function animate()
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    for(object of objectList)
        if(object)
            object.rotation.y += angle / 2;
}

function run()
{
    requestAnimationFrame(function() { run(); });


    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.02;
    // Render the scene
    renderer.render( scene, camera );

    // Spin the cube for next frame
    //animate();

    // Update the camera controller
    //orbitControls.update();
    
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    light.color.setRGB(r, g, b);
}

function createScene(canvas)
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 60, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 15, 25);
    camera.lookAt(0,10,0);
    scene.add(camera);

    // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    // orbitControls.target.y = 10;
    // Create a group to hold all the objects
    root = new THREE.Object3D;

    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0x7a7a7a, 1);

    // Create and add all the lights
    directionalLight.position.set(.5, 10, -3);
    directionalLight.target.position.set(0,0,0);
    directionalLight.castShadow = true;
    root.add(directionalLight);

    spotLight = new THREE.SpotLight (0x7a7a7a);
    spotLight.position.set(2, 25, 100);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0xffffff, 0.8);
    root.add(ambientLight);

    // Create the objects
    loadObj(objModelUrl, objectList);


    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    let map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let color = 0xffffff;


    // Put in a ground plane to show off the lighting
    let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    group.add( mesh );

    transFormControls = new THREE.TransformControls( camera, renderer.domElement );
    transFormControls.addEventListener('change', renderer);
    transFormControls.attach(objectList[0]);

   
    scene.add(transFormControls);
    // add event listener to highlight dragged objects
    scene.add( root );
}