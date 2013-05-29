var camera, scene, renderer, composer;
var geometry, material, textNodes;

function initEffects(w, h, cfg) {
    renderer.autoClear = false;

    var renderModel = new THREE.RenderPass(scene, camera);

    var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1/w, 1/h);

    var effectFilm = new THREE.FilmPass(0.2, 0.1, 100, false);
    effectFilm.renderToScreen = true;

    composer = new THREE.EffectComposer(renderer);

    composer.addPass(renderModel);
    //composer.addPass(effectFXAA);
    composer.addPass(effectFilm);
}

function init(cfg) {
    var captchaElem = document.getElementById('captcha');
    var w = captchaElem.offsetWidth, h = captchaElem.offsetHeight;

    camera = new THREE.PerspectiveCamera(75, w/h, 1, 10000);
    camera.position.z = 1000;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x666666, -100, 1200);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
    dirLight.position.set(0, 0, 1).normalize();
    scene.add(dirLight);

    var pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(0, 100, 90);
    scene.add(pointLight);

    var plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000),
        new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.5, transparent: true}));
    plane.position.y = 100;
    plane.rotation.x = -Math.PI/2;
    scene.add(plane);

    geometry = new THREE.CubeGeometry(200, 200, 200);
    material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});

    if (cfg.text) {
        var letters = cfg.text.value.split('');
        var letterCount = letters.length;
        var wordGeo = new THREE.TextGeometry(cfg.text, cfg.text.cfg);
        wordGeo.computeBoundingBox();
        var wordCenterOffset = {
            x: -0.5*(wordGeo.boundingBox.max.x - wordGeo.boundingBox.min.x),
            y: -0.5*(wordGeo.boundingBox.max.y - wordGeo.boundingBox.min.y)
        };
        textNodes = new THREE.Object3D();
        textNodes.position.x = wordCenterOffset.x*0.80;
        textNodes.position.y = wordCenterOffset.y;

        for (var i = 0; i < letterCount; ++i) {
            var letter = letters[i];
            var textGeo = new THREE.TextGeometry(letter, cfg.text.cfg);
            textGeo.computeBoundingBox();
            var centerOffset = {
                x: -0.5*(textGeo.boundingBox.max.x - textGeo.boundingBox.min.x),
                y: -0.5*(textGeo.boundingBox.max.y - textGeo.boundingBox.min.y)
            };
            var textMesh = new THREE.Mesh(textGeo, cfg.text.material);
            textMesh.position.x = centerOffset.x;
            textMesh.position.y = (-0.5 + Math.random())*centerOffset.y*2;

            var textNode = new THREE.Object3D();
            textNode.position.x = (1.0 + i)*w*2;
            //textNode.position.y = -h*0.5;
            textNode.userData.rotSpeedX = 0.03 + Math.random()*0.05;
            textNode.add(textMesh);
            textNodes.add(textNode);
        }

        scene.add(textNodes);
    }

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(w, h);
    renderer.setClearColor(scene.fog.color, 1);

    initEffects(w, h, cfg);

    captchaElem.appendChild(renderer.domElement);
}

function animate() {
    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame(animate);

    for (var i = 0; i < textNodes.children.length; ++i) {
        var textNode = textNodes.children[i];
        textNode.rotation.y += textNode.userData.rotSpeedX;
    }

    //camera.lookAt(textNodes);
    render();
}

function render() {
    renderer.clear();
    renderer.render(scene, camera);
    composer.render(0.05);
}

// In actual use this cfg would be generated server-side.
var cfg = {
    text: {
        value: 'm0nk3y',
        material: new THREE.MeshFaceMaterial([
            new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.FlatShading}), // front
            new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.SmoothShading}) // side
        ]),
        cfg: {
            font: 'helvetiker',
            weight: 'normal',
            style: 'normal',

            size: 550,
            height: 40,
            curveSegments: 6,
            hover: 30,

            bevelThickness: 10,
            bevelSize: 15,
            bevelSegments: 3,
            bevelEnabled: true,

            material: 0,
            extrudeMaterial: 1
        }
    },
    filters: []
};

init(cfg);
animate();
