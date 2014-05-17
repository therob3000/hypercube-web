function leafLoader(scene) {
    this.scene = scene;
    
    this.totalObjects = 0;
    this.loadedObjects = 0;
    this.onLeaf = null;

    this.objects = [];
    this.geometries = [];
    this.textures = [];
    
    this.objectLoaded = function() {
        this.loadedObjects++;
        if (this.onLeaf != null) {
            this.onLeaf(this.loadedObjects, this.totalObjects);
        }
    }
    
    this.load = function(params) {
        var loader = new THREE.JSONLoader();
        var vineLoader = this;
        vineLoader.totalObjects++;
        
        if (params.texture != null) { 
            vineLoader.totalObjects++;
        }
        var textureCallBack = function() {
            vineLoader.objectLoaded();
        }
        var callback = function(geometry) {
            var texture;
            var material;
            
            if (params.texture != null) { 
                texture = THREE.ImageUtils.loadTexture(params.texture, null, textureCallBack);
            }
            
            var material = new THREE["Mesh" + params.material + "Material"]({ color: params.color, map: texture, shading: THREE.SmoothShading, blending: THREE.AdditiveBlending }); 
            var mesh = new THREE.Mesh(geometry, material);
            
            if (params.inverse) {
                mesh.geometry.dynamic = true
                mesh.geometry.__dirtyVertices = true;
                mesh.geometry.__dirtyNormals = true;
        
                mesh.flipSided = true;
        
                for (var i = 0; i < mesh.geometry.faces.length; i++) {
                    mesh.geometry.faces[i].normal.x = -1 * mesh.geometry.faces[i].normal.x;
                    mesh.geometry.faces[i].normal.y = -1 * mesh.geometry.faces[i].normal.y;
                    mesh.geometry.faces[i].normal.z = -1 * mesh.geometry.faces[i].normal.z;
                }
                mesh.geometry.computeVertexNormals();
                mesh.geometry.computeFaceNormals();
            }
            
            mesh.name = params.name;
            
            if (params.autoAdd == null || params.autoAdd == true) {
                vineLoader.scene.add(mesh);
            }
            
            vineLoader.objects.push(mesh);  
            vineLoader.objectLoaded();   
            
            if (params.name == null) {
                mesh.name = params.model;
            } else {
                mesh.name = params.name;
            }
        }
        loader.load(params.model, callback);
    }

    this.loadGeometry = function(params) {
        var loader = new THREE.JSONLoader();
        var vineLoader = this;
        vineLoader.totalObjects++;
        var callback = function(geometry) {
            vineLoader.geometries.push({ geometry: geometry, name: params.name });
            vineLoader.objectLoaded();
        }
        loader.load(params.model, callback);
    }

    this.loadTexture = function(params) {
        this.totalObjects++;
        var vineLoader = this;
        var textureCallBack = function() {
            vineLoader.objectLoaded();
        }
        this.textures.push({ texture: THREE.ImageUtils.loadTexture(params.texture, null, textureCallBack), name: params.name });
    }

    this.get = function(name) {
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].name == name) {
                return this.objects[i];
            }
        }
        return null;
    }

    this.getGeometry = function(name) {
        for (var i = 0; i < this.geometries.length; i++) {
            if (this.geometries[i].name == name) {
                return this.geometries[i].geometry;
            }
        }
        return null;
    }

    this.getTexture = function(name) {
        for (var i = 0; i < this.textures.length; i++) {
            if (this.textures[i].name == name) {
                return this.textures[i].texture;
            }
        }
        return null;
    }
}

var mt = new MersenneTwister19937();
mt.init_genrand(new Date().getTime() * 10000);

function generateRandomNumber() {
    return mt.genrand_int31();
}

function generateRandomNumberLimit(value) {
    return generateRandomNumber() % value;
}

function generateRandomNumberInRangeN(min, max) {
    var range = Math.abs(max - (min + 1));
    if (range > 0) {
        return (min + generateRandomNumberLimit(range));
    }

    return 0;
}

var container, stats, info;
var camera, scene, renderer, projector;
var debug = true;

var css3dscene, css3drenderer;

var leaf = {
    loader: null,
    game: {
        modes: {
            LOAD_ASSETS: 0,
            IDLE_WAIT_CREDIT: 1,
            IDLE_WAIT_START: 2,
            PRED_GAME: 3,
            SPIN_REELS: 4,
            BIG_WIN_SEQUENCE: 5,
            WIN_SEQUENCE: 6,
            END_GAME: 7,
            CASH_OUT_SEQUENCE: 8,
            INFO: 9,
            EXIT: 10
        },
        cmode: 0,
        pmode: 0,
    },
    animate: {
        pip_highlight_count: 10,
        pip_highlight_cval: false,
        pip_highlight_tout: false,
    },
    screens: {
        info: null,
    },
    timeouts: {
        info: null,
    },
    booleans: {
        info: null,
    }
};

var cpc = {
    x: 0,
    y: 0,
    angle: 0,
    look: { x: 0, y: 10, z: 0 }
};

var evc = {
    keys: [],
    mouse: { x: 0, y: 0 }
};

var symbols = [
    { symbol: '♘', name: 'Squire', details: 'The Duke' },
    { symbol: '☠', name: 'Jack', details: 'The Reaper' },
    { symbol: '♕', name: 'Queen', details: 'The Dominator' },
    { symbol: '♔', name: 'King', details: 'The Ruler' },
    { symbol: '♠', name: 'Ace', details: 'The Hero' },
    { symbol: '✬', name: 'Star', details: 'The Fallen' },
    { symbol: '❂', name: 'Sun', details: 'The Light' },
    { symbol: '₪', name: 'Unknown', details: 'Unknown' }
];

var wintable = {
    bets: [
        1, 2, 3
    ],
    paytable: [
        [
            [5, 4, 3],
            [5, 4, 3],
            [5, 4, 3]
        ],
        [
            [5, 4, 3],
            [5, 4, 3],
            [5, 4, 3]
        ],
        [
            [5, 4, 3],
            [5, 4, 3],
            [5, 4, 3]
        ],
        [
            [5, 4, 3],
            [5, 4, 3],
            [5, 4, 3]
        ],
        [
            [5, 4, 3],
            [5, 4, 3],
            [5, 4, 3]
        ],
        [
            [5, 4, 3],
            [5, 4, 3],
            [5, 4, 3]
        ],
        [
            [5, 4, 3],
            [5, 4, 3],
            [5, 4, 3]
        ],
        [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ],
    ],
    winlines: [
        [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ],
        [
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0
        ],
        [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ],
        [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
            0, 1, 0,
            1, 0, 0
        ],
        [
            0, 0, 1,
            0, 1, 0,
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]
    ]
};

var table = [
    -680, 340,
    -680, 0,
    -680, -340,

    -340, 340,
    -340, 0,
    -340, -340,

    0, 340,
    0, 0,
    0, -340,

    340, 340,
    340, 0,
    340, -340,

    680, 340,
    680, 0,
    680, -340
];

var reels = [
    [
        3, 2, 3, 4, 2, 2, 1, 6, 1, 3,
        3, 0, 2, 6, 6, 5, 4, 6, 5, 6,
        2, 6, 2, 4, 6, 5, 0, 3, 0, 2,
        5, 1, 4, 5, 2, 5, 3, 5, 5, 1,
        4, 4, 5, 0, 6, 5, 3, 0, 6, 4,
        5, 2, 1, 2, 1
    ],
    [
        2, 0, 3, 2, 6, 1, 4, 5, 1, 6,
        4, 3, 1, 2, 4, 1, 4, 1, 0, 0,
        1, 1, 5, 5, 6, 2, 6, 4, 6, 5,
        4, 4, 6, 3, 6, 1, 4, 3, 0, 6,
        4, 0, 0, 6, 2, 1, 5, 3, 5, 3,
        6, 3, 6, 4, 2, 5, 1, 5, 2, 0,
        5, 1, 4, 1, 4, 2
    ],
    [
        0, 6, 6, 0, 0, 6, 0, 3, 0, 1,
        4, 4, 2, 1, 2, 3, 5, 2, 0, 3,
        5, 1, 1, 0, 4, 4, 3, 5, 4, 3,
        2, 6, 6, 2, 5, 2, 0, 3, 2, 4,
        0, 5, 6, 2, 1, 5, 3, 3, 4, 2,
        5, 2, 6, 0, 3, 3
    ],
    [
        0, 3, 3, 5, 2, 6, 0, 1, 0, 4,
        1, 6, 2, 0, 4, 6, 2, 4, 0, 4,
        2, 3, 6, 2, 6, 4, 1, 1, 4, 0,
        3, 6, 6, 4, 1, 6, 1, 6, 4, 6,
        4, 5, 3, 1, 6, 4, 1, 6, 1, 2,
        2, 0, 4, 1, 6, 6, 2, 4, 3, 0,
        4, 0, 2, 1, 6, 6, 2
    ],
    [
        0, 3, 5, 4, 3, 0, 5, 1, 1, 2,
        3, 3, 1, 5, 6, 2, 3, 6, 4, 0,
        6, 2, 0, 5, 4, 0, 1, 6, 1, 3,
        5, 6, 1, 2, 3, 5, 1, 2, 4, 3,
        5, 1, 3, 6, 5, 0, 3, 4, 4, 1,
        0, 0, 3, 5, 2, 3, 4, 3, 3, 2,
        1, 3, 3, 0, 6, 0, 1
    ]
];

var bank ={
    credit: 0,
    winnings: 0,
    bet: 0,
};

var objects = { reels: [], pips: [], btns: [] };
var targets = { table: [], scatter: [] };

var winschk = { 
    chkpos: [],
    chksym: [],
    info: {
        type: 0,
        symbol: 0,
        direction: 0,
        count: 0,
        scatter: 0
    }
};

if (window.innerHeight > window.innerWidth) {
    alert("Turn your device onto landscape mode and reload in order to view the contents of this page!");
} else {
    initialize();
    setup();
}

function initializeDebug() {
    container = document.createElement('div');
    document.body.appendChild(container);

    info = document.createElement('div');
    info.className = 'info_debug';
    info.textContent = '';
    container.appendChild(info);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0';
    stats.domElement.style.left = '0';
    container.appendChild(stats.domElement);
}

function initialize() {
    console.log('initialize hypercube');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    scene = new THREE.Scene();
    css3dscene = new THREE.Scene();
    projector = new THREE.Projector();

    for (var i = 0; i < table.length; i += 2) {
        var element = symbols[generateRandomNumberLimit(7)];

        var reel = document.createElement('div');
        reel.className = 'reel';
        reel.style.backgroundColor = 'rgba(0, 170, 255,' + (Math.random() * 0.5 + 0.25) + ')';

        var symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.textContent = element.symbol;
        reel.appendChild(symbol);

        var details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = element.name + '<br>' + element.details;
        reel.appendChild(details);

        var object = new THREE.CSS3DObject(reel);
        object.position.x = Math.random() * 4000 - 2000;
        object.position.y = Math.random() * 4000 - 2000;
        object.position.z = Math.random() * 4000 - 2000;
        css3dscene.add(object);

        objects.reels.push(object);

        var anobject = new THREE.Object3D();
        anobject.position.x = table[i + 0];
        anobject.position.y = table[i + 1];

        targets.table.push(anobject);
    }
 
    for (var i = 0; i < objects.reels.length; i++) {

        var object = new THREE.Object3D();
        object.position.x = Math.random() * 4000 - 2000;
        object.position.y = Math.random() * 4000 - 2000;
        object.position.z = Math.random() * 4000 + 2000;

        targets.scatter.push(object);
    }

    function createLogoDisp() {
        var logo = document.createElement('div');
        logo.className = 'logo';

        var title = document.createElement('div');
        title.className = 'title';
        title.textContent = 'hypercube';
        logo.appendChild(title);

        var object = new THREE.CSS3DObject(logo);

        object.position.x = -350;
        object.position.y = 600;
        object.position.z = 10;

        css3dscene.add(object);
    }

    function createNaviDisp() {
        var spin = document.createElement('div');
        spin.className = 'spin';
        spin.style.backgroundColor = 'rgba(255, 255, 51,' + (Math.random() * 0.5 + 0.25) + ')';

        var spin_in = document.createElement('div');
        spin_in.className = 'inner';
        spin.appendChild(spin_in);

        var spin_sym = document.createElement('div');
        spin_sym.className = 'symbol';
        spin_sym.textContent = '₪';
        spin_in.appendChild(spin_sym);

        var object_spin = new THREE.CSS3DObject(spin);
        object_spin.position.x = 0;
        object_spin.position.y = -620;
        object_spin.position.z = 0;
        css3dscene.add(object_spin);
        objects.btns.push(object_spin);

        var info = document.createElement('div');
        info.className = 'info';
        info.style.backgroundColor = 'rgba(255, 255, 51,' + (Math.random() * 0.5 + 0.25) + ')';

        var info_txt = document.createElement('div');
        info_txt.className = 'txt';
        info_txt.textContent = 'ℹ';
        info.appendChild(info_txt);

        var object_info = new THREE.CSS3DObject(info);
        object_info.position.x = -220;
        object_info.position.y = -620;
        object_info.position.z = 0;
        css3dscene.add(object_info);
        objects.btns.push(object_info);

        var autoplay = document.createElement('div');
        autoplay.className = 'autoplay';
        autoplay.style.backgroundColor = 'rgba(255, 255, 51,' + (Math.random() * 0.5 + 0.25) + ')';

        var autoplay_txt = document.createElement('div');
        autoplay_txt.className = 'txt';
        autoplay_txt.textContent = '♨';
        autoplay.appendChild(autoplay_txt);

        var object_autoplay = new THREE.CSS3DObject(autoplay);
        object_autoplay.position.x = 220;
        object_autoplay.position.y = -620;
        object_autoplay.position.z = 0;
        css3dscene.add(object_autoplay);
        objects.btns.push(object_autoplay);
    }

    function createBankDisp() {
        var winnings = document.createElement('div');
        winnings.className = 'winnings';
        winnings.style.backgroundColor = 'rgba(255, 255, 51,' + (Math.random() * 0.5 + 0.25) + ')';

        var inner_wins = document.createElement('div');
        inner_wins.className = 'inner_win';
        inner_wins.textContent = '';
        winnings.appendChild(inner_wins);

        var wins_number = document.createElement('div');
        wins_number.className = 'number';
        wins_number.textContent = '0';
        inner_wins.appendChild(wins_number);

        var object_winnings = new THREE.CSS3DObject(winnings);
        object_winnings.position.x = 660;
        object_winnings.position.y = -620;
        object_winnings.position.z = 0;
        css3dscene.add(object_winnings);

        var credit = document.createElement('div');
        credit.className = 'credit';
        credit.style.backgroundColor = 'rgba(255, 255, 51,' + (Math.random() * 0.5 + 0.25) + ')';

        var inner_bets = document.createElement('div');
        inner_bets.className = 'inner_bet';
        inner_bets.textContent = '';
        credit.appendChild(inner_bets);

        var inner_bet_inc = document.createElement('div');
        inner_bet_inc.className = 'bet_opt_up';
        inner_bet_inc.textContent = '▲';
        inner_bets.appendChild(inner_bet_inc);

        var inner_bet_num = document.createElement('div');
        inner_bet_num.className = 'bet_num';
        inner_bet_num.textContent = '0';
        inner_bets.appendChild(inner_bet_num);

        var inner_bet_dec = document.createElement('div');
        inner_bet_dec.className = 'bet_opt_down';
        inner_bet_dec.textContent = '▼';
        inner_bets.appendChild(inner_bet_dec);

        var inner_credit = document.createElement('div');
        inner_credit.className = 'inner_credit';
        inner_credit.textContent = '';
        credit.appendChild(inner_credit);

        var credit_number = document.createElement('div');
        credit_number.className = 'number';
        credit_number.textContent = '0';
        inner_credit.appendChild(credit_number);

        var object_credit = new THREE.CSS3DObject(credit);
        object_credit.position.x = -660;
        object_credit.position.y = -620;
        object_credit.position.z = 0;
        css3dscene.add(object_credit);
    }

    function createWinPipDisp() {
        var numbers = [5, 3, 1, 2, 4, 4, 2, 1, 3, 5];
        var pos = [
            320, 160, 0, -160, -320,
            -320, -160, 0, 160, 320
        ];

        for (var i = 0; i < numbers.length; i++) {

            var pip = document.createElement('div');
            pip.className = 'pip';

            var number = document.createElement('div');
            number.className = 'number';
            number.textContent = numbers[i].toString();
            pip.appendChild(number);

            var object = new THREE.CSS3DObject(pip);

            if (i > 4) {
                object.position.x = (950 * -1);
            } else {
                object.position.x = 950 - 70;
            }

            object.position.y = pos[i];
            object.position.z = 10;

            css3dscene.add(object);
            objects.pips.push(object);
        }
    }

    function createInfoScreenDisp() {
        var info_base = document.createElement('div');
        info_base.className = 'info_base';
        info_base.style.backgroundColor = 'rgba(255, 255, 51,' + (Math.random() * 0.5 + 0.25) + ')';

        var inner_base = document.createElement('div');
        inner_base.className = 'inner';
        info_base.appendChild(inner_base);

        var changeable_info_base = document.createElement('div');
        changeable_info_base.className = 'changeable';
        inner_base.appendChild(changeable_info_base);

        var static_info_base = document.createElement('div');
        static_info_base.className = 'static';
        static_info_base.innerHTML = 'Only the highest win per active bet line from both ways is paid. <br>' +
            'Bet line wins pay when in succession from both leftmost to right and rightmost to left. <br>' +
            'Malfunction voids all pays. <br>';
        inner_base.appendChild(static_info_base);

        var exit_btn = document.createElement('div');
        exit_btn.className = 'exit';
        info_base.appendChild(exit_btn);

        var exit_txt = document.createElement('div');
        exit_txt.className = 'txt';
        exit_txt.textContent = 'Exit';
        exit_btn.appendChild(exit_txt);

        var navi = document.createElement('div');
        navi.className = 'navi';
        info_base.appendChild(navi);

        var next_btn = document.createElement('div');
        next_btn.className = 'next';
        navi.appendChild(next_btn);

        var next_txt = document.createElement('div');
        next_txt.className = 'txt';
        next_txt.textContent = 'Next';
        next_btn.appendChild(next_txt);

        var prev_btn = document.createElement('div');
        prev_btn.className = 'prev';
        navi.appendChild(prev_btn);

        var prev_txt = document.createElement('div');
        prev_txt.className = 'txt';
        prev_txt.textContent = 'Previous';
        prev_btn.appendChild(prev_txt);

        var object = new THREE.CSS3DObject(info_base);
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 0;

        object.element.style.display = 'none';
        object.visible = false;

        leaf.screens.info = object;
        css3dscene.add(object);
    }

    createLogoDisp();
    createNaviDisp();
    createBankDisp();
    createWinPipDisp();
    createInfoScreenDisp();

    css3drenderer = new THREE.CSS3DRenderer();
    css3drenderer.setSize(window.innerWidth, window.innerHeight);
    css3drenderer.domElement.style.position = 'absolute';
    css3drenderer.domElement.style.top = 0;
    css3drenderer.domElement.style.left = 0;
    document.body.appendChild(css3drenderer.domElement);

    if (debug) {
        initializeDebug();
    }
}

function setup() {
    leaf.loader = new leafLoader(scene);
    leaf.loader.onLeaf = progress;

    leaf.loader.load({ color: 0xFFFFFF, name: 'spin', model: 'assets/models/spin.js', texture: 'assets/models/spin.png', material: 'Basic' });
}

function progress(o, c) {
    if (debug) {
        var percent = Math.floor(o / c * 100);
        info.textContent = percent;
    }

    if (o / c * 100 == 100) {
        if (debug) {
            info.textContent = '';
        }

        function targetsDefault() {
            var position = [];
            for (var i = 0; i < objects.reels.length; i++) {
                var object = new THREE.Object3D();
                object.position.x = 0;
                object.position.y = 0;
                object.position.z = 512;

                position.push(object);
            }

            return position;
        }

        function setNaviFunc() {
            objects.btns[0].element.addEventListener('mousedown', function(e) {
                var target = targetsDefault();
                transformSpinReels(target, targets.table, 1000);
            }, false);

            objects.btns[1].element.addEventListener('mousedown', function(e) {
                if (!leaf.booleans.info) {
                    window.clearTimeout(leaf.timeouts.info);
                    leaf.booleans.info = true;
                    transform(targets.scatter, 1000);
                    leaf.timeouts.info = window.setTimeout(function() {
                        leaf.screens.info.element.style.display = '';
                        leaf.screens.info.visible = true;
                    }, 2000);
                } else {
                    window.clearTimeout(leaf.timeouts.info);
                    leaf.booleans.info = false;
                    leaf.screens.info.element.style.display = 'none';
                    leaf.screens.info.visible = false;
                    leaf.timeouts.info = window.setTimeout(function() {
                        transform(targets.table, 1000);
                    }, 220);
                }
            }, false);

            objects.btns[2].element.addEventListener('mousedown', function(e) {

            }, false);
        }

        function setPipsFunc() {
            function winlineHighlight(winline) {
                if (winline != null) {
                    for (var j = 0; j < objects.reels.length; j++) {

                        var object = objects.reels[j];
                        if (winline[j]) {
                            leaf.animate.pip_highlight_count--;
                            leaf.animate.pip_highlight_cval = true;

                            object.element.style.backgroundColor = 'rgba(7, 237, 7,' + (Math.random() * 0.5 + 0.25) + ')'; 
                        } else {
                            object.element.style.backgroundColor = 'rgba(0, 170, 255,' + (Math.random() * 0.5 + 0.25) + ')';
                        }
                    }
                }
            }

            objects.pips[0].element.addEventListener('mouseover', function(event) {
                event.preventDefault();

                var winline = wintable.winlines[3];
                winlineHighlight(winline);
            }, false);

            objects.pips[9].element.addEventListener('mouseover', function(event) {
                event.preventDefault();

                var winline = wintable.winlines[3];
                winlineHighlight(winline);
            }, false);

            objects.pips[1].element.addEventListener('mouseover', function(event) {
                event.preventDefault();

                var winline = wintable.winlines[1];
                winlineHighlight(winline);
            }, false);

            objects.pips[8].element.addEventListener('mouseover', function(event) {
                event.preventDefault();

                var winline = wintable.winlines[1];
                winlineHighlight(winline);
            }, false);

            objects.pips[2].element.addEventListener('mouseover', function(event) {
                event.preventDefault();

                var winline = wintable.winlines[0];
                winlineHighlight(winline);
            }, false);

            objects.pips[7].element.addEventListener('mouseover', function(event) {
                event.preventDefault();

                var winline = wintable.winlines[0];
                winlineHighlight(winline);
            }, false);

            objects.pips[3].element.addEventListener('mouseover', function(event) {
                event.preventDefault();

                var winline = wintable.winlines[2];
                winlineHighlight(winline);
            }, false);

            objects.pips[6].element.addEventListener('mouseover', function(event) {
                event.preventDefault();

                var winline = wintable.winlines[2];
                winlineHighlight(winline);
            }, false);

            objects.pips[4].element.addEventListener('mouseover', function(event) {
                event.preventDefault();

                var winline = wintable.winlines[4];
                winlineHighlight(winline);
            }, false);

            objects.pips[5].element.addEventListener('mouseover', function(event) {
                event.preventDefault();

                var winline = wintable.winlines[4];
                winlineHighlight(winline);
            }, false);
        }

        setNaviFunc();
        setPipsFunc();

        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('keyup', onKeyUp, true);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);

        transform(targets.table, 5000);
        animate();
    }
}

function animate() {
    requestAnimationFrame(animate);
    camera.lookAt(cpc.look);

    css3drenderer.render(css3dscene, camera);

    TWEEN.update();
    leaf.animate.pip_highlight_count = 10;

    //! Recursive screen orientation checking
    if (window.innerHeight > window.innerWidth) {
        window.location.reload();
    }

    if (debug) {
        stats.update();
    }
}

function transform(targets, duration) {
    TWEEN.removeAll();

    for (var i = 0; i < objects.reels.length; i++) {
        var object = objects.reels[i];
        var target = targets[i];

        new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        
        new TWEEN.Tween(object.rotation)
            .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }
}

function transformSpinReels(targets, targets_e, duration) {
    TWEEN.removeAll();

    var reel_anim = 0;
    function tweenCallback() {
        reel_anim++;

        if (reel_anim >= 15) {
            spinReels();
            window.setTimeout(function() {
                transform(targets_e, 1000)
            }, 1000);
        }
    }

    for (var i = 0; i < objects.reels.length; i++) {
        var object = objects.reels[i];
        var target = targets[i];

        do_tween = new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        
        new TWEEN.Tween(object.rotation)
            .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        do_tween.onComplete(tweenCallback);
    }
}

function sleep(ms) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > ms) {
            break;
        }
    }
}

function spinReels() {
    var rand = [];
    for (var i = 0; i < reels.length; i++) {

        var reel = reels[i];
        rand[i] = generateRandomNumberInRangeN(0, reel.length);
    }

    for (var i = 0; i < rand.length; i++) {
        winschk.chkpos[i] = rand[i];
    }

    console.log('Generated Random Number: ' + rand[0] + ' ' + rand[1] + ' ' + rand[2] + ' ' + rand[3] + ' ' + rand[4]);

    function getSymbol(r, p) {
        var reel = reels[r];
        var symbol = null;
        
        if (p == 0) {
            symbol = symbols[reel[rand[r] - 1]];
            symbol.value = reel[rand[r] - 1];
            if (((rand[r] - 1) < 0) || symbol == null) {
                console.log('Hit a Negative');
            }
        } else if (p == 1) {
            symbol = symbols[reel[rand[r]]];
            symbol.value = reel[rand[r]];
        } else {
            symbol = symbols[reel[rand[r] + 1]];
            symbol.value = reel[rand[r] + 1];
            if (((rand[r] + 1) >= reel.length) || symbol == null) {
                console.log('Hit a Positive');
            }
        }
    
        return symbol;
    }

    var preel = -1;
    var count = 0;
    for (var i = 0; i < objects.reels.length; i++) {
        
        var object = objects.reels[i];
        var element = 0;
        var reel = -1;

        if (i >= 0 && i < 3) {
            reel = 0;
        } else if (i >= 3 && i < 6) {
            reel = 1;
        } else if (i >= 6 && i < 9) {
            reel = 2;
        } else if (i >= 9 && i < 12) {
            reel = 3;
        } else if (i >= 12 && i < 16) {
            reel = 4;
        } else {
            console.log('Fatal Exception: Array out of boundaries.');
        }

        if (reel != -1) {
            if (preel == reel) {
                count++;
            } else {
                preel = reel;
                count = 0;
            }

            element = getSymbol(reel, count);

            if (element != null) {
                winschk.chksym[i] = element;

                if (object.element.className == 'reel') {
                    for (var j = 0; j < object.element.children.length; j++) {

                        var child = object.element.children[j];
                        if (child.className == 'symbol') {
                            child.textContent = element.symbol;
                        }

                        if (child.className == 'details') {
                            child.innerHTML = element.name + '<br>' + element.details;
                        }
                    }
                }
            }
        }
    }

    winCheck();
}

function winCheck() {
    var foundpos = 0;

    if (winschk.chkpos.length) {

        if (debug) {
            var debug_usesym = true;
            if (debug_usesym) {
                for (var i = 0; i < winschk.chksym.length; i += 3) {
                    console.log('Generated Symbol: ' + winschk.chksym[i].symbol + ' ' + winschk.chksym[i + 1].symbol + ' ' + winschk.chksym[i + 2].symbol);
                }
            } else {
                for (var i = 0; i < winschk.chksym.length; i += 3) {
                    console.log('Generated Symval: ' + winschk.chksym[i].value + ' ' + winschk.chksym[i + 1].value + ' ' + winschk.chksym[i + 2].value);
                }
            }
        }

        //! Left-to-Right
        for (var i = 0; i < 3; i++) {
            switch (i) {
                case 0:
                    if (winschk.chksym[i].value == winschk.chksym[3].value) {
                        foundpos = 1;
                    }

                    if (winschk.chksym[i].value == winschk.chksym[4].value) {
                        foundpos = 2;
                    }
                break;
                case 1:
                    if (winschk.chksym[i].value == winschk.chksym[3].value) {
                        foundpos = 1;
                    }

                    if (winschk.chksym[i].value == winschk.chksym[4].value) {
                        foundpos = 2;
                    }

                    if (winschk.chksym[i].value == winschk.chksym[5].value) {
                        foundpos = 3;
                    }
                break;
                case 2:
                    if (winschk.chksym[i].value == winschk.chksym[4].value) {
                        foundpos = 2;
                    }

                    if (winschk.chksym[i].value == winschk.chksym[5].value) {
                        foundpos = 3;
                    }
                break;
            }

            if (foundpos) {
                winschk.info.direction = 0;
                winschk.info.symbol = winschk.chksym[i].value;

                if (foundpos) {
                    for (var j = 0; j < wintable.winlines.length; j++) {
                        var counter = 0;
                        var winline = wintable.winlines[j];

                        for (var k = 0; k < winline.length; k++) {
                            if (winline[k]) {
                                if (winschk.chksym[k].value == winschk.info.symbol) {
                                    console.log('Hit 1');
                                    counter++;

                                    if (counter > 2) {
                                        winschk.info.type = k;
                                        console.log('Hit 2');
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

    }
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1, 0.5);
    projector.unprojectVector(vector, camera);

    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    
    var intersects = ray.intersectObjects(scene.children);
    if (intersects.length > 0) {
        var target = intersects[0].object;
    }
}

function onDocumentMouseMove(event) {
    event.preventDefault();

    evc.mouse.x = event.clientX;
    evc.mouse.y = event.clientY;

    var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1, 0.5);
    projector.unprojectVector(vector, camera);

    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    
    var intersects = ray.intersectObjects(scene.children);
    if (intersects.length > 0) {
        var target = intersects[0].object;
    }

    if (leaf.animate.pip_highlight_count == 10 && leaf.animate.pip_highlight_cval) {
        window.clearTimeout(leaf.animate.pip_highlight_tout);

        leaf.animate.pip_highlight_tout = window.setTimeout(function () {
            for (var j = 0; j < objects.reels.length; j++) {
                var object = objects.reels[j];
                object.element.style.backgroundColor = 'rgba(0, 170, 255,' + (Math.random() * 0.5 + 0.25) + ')';
            }

            leaf.animate.pip_highlight_cval = false;
        }, 1200);
    }
}

function onKeyDown(event) {
    evc.keys[event.keyCode] = true;
}

function onKeyUp(event) {
    evc.keys[event.keyCode] = false;
}

