let view;
let ctx;
let scene;
let start_time;

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

// Initialization function - called when web page loads
function init() {
    let w = 800;
    let h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
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
                ],
                matrix: new Matrix(4, 4)
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', onKeyDown, false);
    
    // start animation loop
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(animate);
}

// Animation loop - repeatedly calls rendering code
function animate(timestamp) {
    // step 1: calculate time (time since start)
    let time = timestamp - start_time;
    
    // step 2: transform models based on time
    // TODO: implement this!

    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    // window.requestAnimationFrame(animate);
}

function drawScene() {
    console.log(scene);
    //  * transform to canonical view volume
    let prp = scene.view.prp;
    let srp = scene.view.srp;
    let vup = scene.view.vup;
    let clip = scene.view.clip;
    
    let matrix = mat4x4Perspective(prp, srp, vup, clip);
    let mper = mat4x4MPer();
    let v = vMat(view.width, view.height);
    //  * clip in 3D
    let zmin = -clip[4]/clip[5];
    //  * project to 2D
    //matrix, clip, mper, v - flip in matrix mult
    let proj = Matrix.multiply([v, mper, matrix]);
    
    //  * draw line
    let new_verts = [];
    for(let i = 0; i < scene.models.length; i++) { //Looping through all models
        let model = scene.models[i];
        
        //Just multiply vertices by matrix then clip
        for(let j = 0; j < model.vertices.length; j++) { //Looping through all vertices
            new_verts.push(Matrix.multiply([proj, model.vertices[j]]));
            new_verts[j].x = new_verts[j].x/ new_verts[j].w;
            new_verts[j].y = new_verts[j].y/ new_verts[j].w;
            new_verts[j].z = new_verts[j].z/ new_verts[j].w;
            new_verts[j].w = 1; 
        }
        for(let k = 0; k < model.edges.length; k++) { //Looping through edges
            for(let l = 0; l < model.edges[k].length - 1; l++) { //Looping through each connecting edge
                let index = model.edges[k][l];
                let index2 = model.edges[k][l+1];

                let point1 = new_verts[index];
                let point2 = new_verts[index2];
                
                drawLine(point1.x, point1.y, point2.x, point2.y);
            }
        
        }
        //let clipvert = [];
        //let length = new_verts.length;
        /*
        for(let k = 0; k < length - 1; k++) {
            let line = {pt0: new_verts[k], pt1: new_verts[k+1]};
            //console.log(line);
            let clipped = clipLinePerspective(line, zmin);
            clipvert.push(clipped);
            console.log(clipvert[k])
        }
        */
        
    }
}

function vMat(w, h) {
    let vMat = new Matrix(4,4);
    vMat.values =  [[w/2, 0,  0,  w/2],
                    [0, h/2,  0,  h/2],
                    [0,  0,   1,   0 ],
                    [0,  0,   0,   1 ]];
    return vMat;
}



// Get outcode for vertex (parallel view volume)
function outcodeParallel(vertex) {
    let outcode = 0;
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (1.0 + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (-1.0 - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (1.0 + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (0.0 + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Get outcode for vertex (perspective view volume)
function outcodePerspective(vertex, z_min) {
    let outcode = 0;
    if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (z_min + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLineParallel(line) {
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);
    
    // TODO: implement clipping here!
    
    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    //Case 2 and default
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);
    
    // TODO: implement clipping here!
    let bitwiseOR = out0 | out1;
    let bitwiseAND = out0 & out1;
    while(true) {
        if(bitwiseOR == 0) {
            break;
        } else if (bitwiseAND != 0) {
            break;
        } else { // We know at least one of the points are out of bounds
    
            //Determining which outcode we deal with first
            let outcode = 0;
            let holderpt = 0;
            if(out1 > out0) {
                outcode = out1;
                holderpt = pt1;
            } else {
                outcode = out0;
                holderpt = pt0;
            }

            let x, y, z = 0;
            let t = 0;
            //Just to simplify expressions
            let deltax = pt1.x - pt0.x;
            let deltay = pt1.y - pt0.y;
            let deltaz = pt1.z - pt0.z;
            if(outcode & LEFT) {
                t = -pt0.x + pt0.z/(deltax - deltaz);
                x = (1-t) * pt0.x + t * pt1.x;
                y = holderpt.y;
                z = holderpt.z;
                
            } else if (outcode & RIGHT) {
                t = pt0.x + pt0.z/(-deltax - deltaz);
                x = (1-t) * pt0.x + t * pt1.x;
                y = holderpt.y;
                z = holderpt.z;

            } else if (outcode & BOTTOM) {
                t = -pt0.y + pt0.z/(deltay - deltaz);
                y = (1-t) * pt0.y + t * pt1.y;
                x = holderpt.x;
                z = holderpt.z;

            } else if (outcode & TOP) {
                t = pt0.y + pt0.z/(-deltay - deltaz);
                y = (1-t) * pt0.y + t * pt1.y;
                x = holderpt.x;
                z = holderpt.z;

            } else if (outcode & NEAR) {
                t = pt0.z - zmin/(-deltaz);
                z = (1-t) * pt0.z + t * pt1.z;
                y = holderpt.y;
                x = holderpt.x;

            } else if (outcode & FAR) {
                t = -pt0.z -1/(deltaz);
                z = (1-t) * pt0.z + t * pt1.z;
                y = holderpt.y;
                x = holderpt.x;
                
            }
            
            if(outcode == out1) {
                pt1.x = x;
                pt1.y = y;
                pt1.z = z;
            } else if (outcode == out0) {
                pt0.x = x;
                pt0.y = y;
                pt0.z = z;
            } 
        }
    }
    
    return result;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            
            break;
        case 65: // A key
            console.log("A");
            scene.view.prp.x = scene.view.prp.x - 10;
            scene.view.srp.x = scene.view.srp.x - 10;
            console.log(scene.view.prp.x);
            
            break;
        case 68: // D key
            console.log("D");
            scene.view.prp.x = scene.view.prp.x + 10;
            scene.view.srp.x = scene.view.srp.x + 10;
            console.log(scene.view.prp.x);
            
            break;
        case 83: // S key
            console.log("S");
            scene.view.prp.y = scene.view.prp.y - 10;
            scene.view.srp.y = scene.view.srp.y - 10;
            console.log(scene.view.prp.y);
            
            break;
        case 87: // W key
            console.log("W");
            scene.view.prp.y = scene.view.prp.y + 10;
            scene.view.srp.y = scene.view.srp.y + 10;
            console.log(scene.view.prp.y);
            
            break;
    }
}

///////////////////////////////////////////////////////////////////////////
// No need to edit functions beyond this point
///////////////////////////////////////////////////////////////////////////

// Called when user selects a new scene JSON file
function loadNewScene() {
    let scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    let reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
        scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

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
            scene.models[i].matrix = new Matrix(4, 4);
        }
    };
    reader.readAsText(scene_file.files[0], 'UTF-8');
}

// Draw black 2D line with red endpoints 
function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
