var view;
var ctx;
var scene;
const LEFT = 32;
const RIGHT = 16;
const BOT = 8;
const TOP  = 4;
const FRONT = 2;
const BACK = 1;

// Initialization function - called when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    
    // Animation is in degrees, not radians. 
    // We have to convert that to radians.
    scene = {
        view: {
            type: 'perspective',
            vrp: Vector3(20, 0, -30),
            vpn: Vector3(1, 0, 1),
            vup: Vector3(0, 1, 0),
            prp: Vector3(14, 20, 26),
            clip: [-1, 20, 5, 36, 1, -50]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ]
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);

    DrawScene();
}

// Main drawing code here! Use information contained in variable `scene`
function DrawScene() {

    // Drawing the scene in our two different perspectives
    var perspective = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
    var parallel = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip); 
    console.log(perspective); 
    var i, j, k;
    var Mper = new Matrix(4,4);
    Mper.values =[
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, -1, 0]
    ]
    var transcale = new Matrix(4,4);
    transcale.values = [
        [view.width/2, 0,0,view.width/2],
        [0, view.height/2, 0, view.height/2],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
    for(i = 0; i< scene.models.length; i++) {
        // 1. transform vertices in canonicalVV 
        // 2. Clip against CVV
        // 3. Project onto 2D (Mper matrix)
        // 4. transcale to framebuffer size 
        // 5. Draw all edges
        // step 1
        var tempVertices;
        tempVertices = [];
        for(j = 0; j < scene.models[i].vertices.length; j++) {
            tempVertices.push(Matrix.multiply( perspective, scene.models[i].vertices[j]));
        }

        // 2. 


        // 3. and 4. 
        for(j = 0; j < tempVertices.length; j++) {
            tempVertices[j] = Matrix.multiply( /*transcale,*/ Mper, tempVertices[j]);
            //console.log(tempVertices[j].x / tempVertices[j].w, tempVertices[j].y / tempVertices[j].w);
        }
        //console.log(tempVertices[0].data);
        // 5. 
        for (j = 0; j < scene.models[i].edges.length; j++) {
            var curEdge = scene.models[i].edges[j];
            for (k = 0; k < curEdge.length-1; k++) {
                var curpt1 = tempVertices[curEdge[k]];
                var curpt2 = tempVertices[curEdge[k+1]];
                DrawLine(curpt1.x/curpt1.w, curpt1.y/curpt1.w, curpt2.x/curpt2.w, curpt2.y/curpt2.w);
            }
        }
    }

} // DrawScene

function DrawThings() {
    
}
function GetOutCode(pt, view) {
    var outcode = 0;
    if(pt.x < view.x_min) {
        outcode += LEFT;
    } else if(pt.x > view.x_max) {
        outcode += RIGHT;
    }
    if(pt.y < view.y_min) {
        outcode += BOT;
    } else if(pt.y > view.y_max){
        outcode += TOP;
    }
    if(pt.z < view.z_min) {
        outcode += BACK;
    } else if(pt.z > view.z_max) {
        outcode += FRONT;
    }
    return outcode;
} // GetOutCode

function ClipLine(pt0, pt1, view) {
    var result = {
        pt0: {},
        pt1: {}
    };
    var outcode0 = GetOutCode(pt0, view);
    var outcode1 = GetOutCode(pt1, view);
    var delta_x = pt1.x - pt0.x;
    var delta_y = pt1.y - pt0.y;
    var delta_z = pt1.z - pt0.z;
    var b = pt0.y - ((delta_y / delta_x) * pt0.x);

    var done = false;
    while(!done) {
        if((outcode0 | outcode1) === 0) { // Trivial accept
            done = true;
            result.pt0.x = pt0.x;
            result.pt0.y = pt0.y;
            result.pt0.z = pt0.z;
            result.pt1.x = pt1.x;
            result.pt1.y = pt1.y;
            result.pt1.z = pt1.z;
        } else if ((outcode0 & outcode1) !== 0) { //Trivial reject 
            done = true;
            result = null;
        } else {
            var selected_pt; // we pick a point that is outside the view
            var selected_outcode;
            if(outcode0 > 0) {
                select_pt = pt0;
                selected_outcode = outcode0;
            } else {
                select_pt = pt1;
                selected_outcode = outcode1;
            }
            if((selected_outcode & LEFT) === LEFT) {
                selected_pt.x = view.x_min;
                selected_pt.y = (delta_y / delta_x) * selected_outcode.x + b;
            } else if((selected_outcode & RIGHT) === RIGHT) {
                selected_pt.x = view.x_max;
                selected_pt.y = (delta_y / delta_x) * selected_outcode.x + b;
            } else if((selected_outcode & BOT) === BOT) {
                selected_pt.y = view.y_min;
                selected_pt.x = (selected_pt.y -b) * (delta_x / delta_y);
            } else if((selected_outcode & TOP) === TOP){ // we know it's the top
                selected_pt.y = view.y_max;
                selected_pt.x = (selected_pt.y -b) * (delta_x / delta_y);
            } else if((selected_outcode & FRONT) === FRONT) {
                selected_pt.z = view.z_max;
                selected_pt.x = (selected_pt.y -b) * (delta_x / delta_y);
                selected_pt.y = (delta_y / delta_x) * selected_outcode.x + b;
            } else { // we know it's gonna be BACK
                selected_pt.z = view.z_min;
                selected_pt.x = (selected_pt.y -b) * (delta_x / delta_y);
                selected_pt.y = (delta_y / delta_x) * selected_outcode.x + b;
            }
            if(outcode0 > 0) {
                outcode0 = selected_outcode;
            } else {
                outcode1 = selected_outcode;
            }
        }
    }
    return result;
} // ClipLine

// Called when user selects a new scene JSON file
function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    var reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.vrp = Vector3(scene.view.vrp[0], scene.view.vrp[1], scene.view.vrp[2]);
        scene.view.vpn = Vector3(scene.view.vpn[0], scene.view.vpn[1], scene.view.vpn[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
        }

        DrawScene();
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Called when user presses a key on the keyboard down 
function OnKeyDown(event) {
    var i;
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            for(i =0; i < tempVertices.length; i++) {
                var newX = tempVertices[i].data[0][0] + 0.001;
                tempVertices[i].data[0][0] = newX;
            }

            console.log("left");
            break;
        case 38: // UP Arrow
            for(i =0; i < tempVertices.length; i++) {
                var newZ = tempVertices[i].data[2][0];
                
            }
            console.log("up");
            break;
        case 39: // RIGHT Arrow
            for(i =0; i < tempVertices.length; i++) {
                var curX = tempVertices[i].data[0][0];
            }
            console.log("right");
            break;
        case 40: // DOWN Arrow
            for(i =0; i < tempVertices.length; i++) {
                var curX = tempVertices[i].data[2][0];
            }
            console.log("down");
            break;
    }
}

// Draw black 2D line with red endpoints 
function DrawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
