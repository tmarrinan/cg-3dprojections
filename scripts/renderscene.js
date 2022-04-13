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
        /*view: {
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
        */
        
            view: {
                type: "parallel",
                prp: Vector3(0, 0, 10),
                srp: Vector3(0, 0, 0),
                vup: Vector3(0, 1, 0),
                clip: [-4, 20, -10, 20, -20, 75]
            },
            models: [

                {
                    type:"cylinder",
                    center: Vector3(-6,6,-6),
                    radius:4,
                    height:8,
                    sides: 30
                },
                
                {
                    type: 'generic',
                    vertices: [
                        Vector4( 0,  0, -15, 1),
                        Vector4(10,  0, -15, 1),
                        Vector4(10, 6, -15, 1),
                        Vector4(5, 10, -15, 1),
                        Vector4( 0, 6, -15, 1),
                        Vector4( 0,  0, -30, 1),
                        Vector4(10,  0, -30, 1),
                        Vector4(10, 6, -30, 1),
                        Vector4(5, 10, -30, 1),
                        Vector4( 0, 6, -30, 1)
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

    ctx.clearRect(0, 0, view.width, view.height);
    // step 1: calculate time (time since start)
    let time = timestamp - start_time;
    
    // step 2: transform models based on time
    // TODO: implement this!

    // step 3: draw scene
    newModel()
    drawScene();
    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    window.requestAnimationFrame(animate);
}

function drawScene() {
    console.log(scene);
    //  * transform to canonical view volume
    let prp = scene.view.prp;
    let srp = scene.view.srp;
    let vup = scene.view.vup;
    let clip = scene.view.clip;
    let matrix;
    let proj;
    if(scene.view.type == "perspective") {
        matrix = mat4x4Perspective(prp, srp, vup, clip);
        proj = mat4x4MPer();
    } else {
        matrix = mat4x4Parallel(prp, srp, vup, clip);
        proj = mat4x4MPar();
    }

    let v = vMat(view.width, view.height);
    //  * clip in 3D
    let zmin = -clip[4]/clip[5];
    //  * project to 2D
    //matrix, clip, mper, v - flip in matrix mult
    //let proj = Matrix.multiply([v, mper, matrix]);
    
    //  * draw line
    
    for(let i = 0; i < scene.models.length; i++) { //Looping through all models
        let new_verts = [];
        let model = scene.models[i];
        if(model.type == 'generic') {

            let new_vertex;
            //Just multiply vertices by matrix then clip
            for(let j = 0; j < model.vertices.length; j++) { //Looping through all vertices
                new_vertex = Matrix.multiply([matrix, model.matrix, model.vertices[j]])
                new_verts.push(new_vertex)
            }
            for(let k = 0; k < model.edges.length; k++) { //Looping through edges
                for(let l = 0; l < model.edges[k].length - 1; l++) { //Looping through each connecting edge
                    let index = model.edges[k][l];
                    let index2 = model.edges[k][l+1];

                    let point0 = new_verts[index];
                    let point1 = new_verts[index2];
                    
                    let newline = {
                        pt0: Vector4(point0.x, point0.y, point0.z, 1),
                        pt1: Vector4(point1.x, point1.y, point1.z, 1)
                    }

                    if(scene.view.type == "perspective") {
                        newline = clipLinePerspective(newline, zmin);
                    } else {
                        newline = clipLineParallel(newline);
                    }

                    if(newline == null) {
                        continue;
                    }
                    let new_vert0 = Matrix.multiply([v, proj, newline.pt0]);
                    new_vert0.x = new_vert0.x/ new_vert0.w;
                    new_vert0.y = new_vert0.y/ new_vert0.w;
                
                    let new_vert1 = Matrix.multiply([v, proj, newline.pt1]);
                    new_vert1.x = new_vert1.x/ new_vert1.w;
                    new_vert1.y = new_vert1.y/ new_vert1.w;
                    drawLine(new_vert0.x, new_vert0.y, new_vert1.x, new_vert1.y);
                    
                }
            
            }
        }
    }
}

//generate new models for non-generic shapes
function newModel() {
    console.log(scene);

    for(let i = 0; i < scene.models.length; i++) {
        let ogmodel = scene.models[i];
        let model;

        if(ogmodel.type == 'cube') {

            model = {
                type: "generic",
                vertices: [],
                edges: [],
                matrix: new Matrix(4,4),
                center: ogmodel.center,

            }

            let width = ogmodel.width / 2
            let height = ogmodel.height / 2
            let depth = ogmodel.depth / 2

            model.vertices.push(...[
                Vector4(-width, height, -depth, 1),
                Vector4(width, height, -depth, 1),
                Vector4(width, -height, -depth, 1),
                Vector4(-width, -height, -depth, 1),
                Vector4(-width, height, depth, 1),
                Vector4(width, height, depth, 1),
                Vector4(width, -height, depth, 1),
                Vector4(-width, -height, depth, 1),
                
            ])

            let translate = new Matrix(4, 4)
            mat4x4Translate(translate, model.center.x, model.center.y, model.center.z) //translating to the center point
            for (let i = 0; i < model.vertices.length; i++) {
                model.vertices[i] = new Vector(Matrix.multiply([translate, model.vertices[i]]))
            }

            model.edges.push(...[
                [0, 1, 2, 3, 0],
                [4, 5, 6, 7, 4],
                [0, 4],
                [1, 5],
                [2, 6],
                [3, 7]
            ])

            scene.models[i] = model;

        } else if (ogmodel.type == 'cone') {

            let model = {
                type: 'generic',
                vertices: [],
                edges: [],
                matrix: new Matrix(4, 4),
                center: ogmodel.center
            }
        
            let radius = ogmodel.radius;
            let height = ogmodel.height;
            let sides = ogmodel.sides;
            // lower vertices of base
            let mult = Math.PI * 2
            for (let i = 0; i < sides; i += 1) {
                let x = mult * (i / sides)
                let new_vertex = new Vector4(Math.sin(x) * radius, -(height / 2), Math.cos(x) * radius, 1)
                model.vertices.push(new_vertex)
            }
            //top vertex of cone
            model.vertices.push(new Vector4(0, (height / 2), 0, 1))
        
            let translate = new Matrix(4, 4)
            mat4x4Translate(translate, model.center.x, model.center.y, model.center.z) //translating to the center point
            for (let i = 0; i < model.vertices.length; i++) {
                model.vertices[i] = new Vector(Matrix.multiply([translate, model.vertices[i]]))
            }
        
            model.edges.push([...Array(sides).keys(), 0])
        
            for (let i = 0; i < model.vertices.length - 1; i++) {
                model.edges.push([i, model.vertices.length - 1])
            }

            scene.models[i] = model;

        } else if (ogmodel.type == 'cylinder') {

            let model = {
                type: 'generic',
                vertices: [],
                edges: [],
                matrix: new Matrix(4, 4),
                center: ogmodel.center
            }
        
            let radius = ogmodel.radius;
            let height = ogmodel.height;
            let sides = ogmodel.sides;
            // lower vertices of base
            let mult = Math.PI * 2
            for (let i = 0; i < sides; i += 1) {
                let x = mult * (i / sides)
                let new_vertex = new Vector4(Math.sin(x) * radius, -(height / 2), Math.cos(x) * radius, 1)
                model.vertices.push(new_vertex)
            }
            // top vertices of cylinder
            for (let i = 0; i < sides; i += 1) {
                let x = mult * (i / sides)
                let new_vertex = new Vector4(Math.sin(x) * radius, (height / 2), Math.cos(x) * radius,1)
                model.vertices.push(new_vertex)
            }

            let translate = new Matrix(4, 4)
            mat4x4Translate(translate, model.center.x, model.center.y, model.center.z) //translating to the center point
            for (let i = 0; i < model.vertices.length; i++) {
                model.vertices[i] = new Vector(Matrix.multiply([translate, model.vertices[i]]))
            }

            let c_bottom = []
            let c_top = []
            for (let i = 0; i < sides; i++) {
                c_bottom.push(i)
                c_top.push(sides + i)
                model.edges.push([i, sides + i])
            }
            //connect back to first point
            c_bottom.push(0)
            //connect back to original point of top
            c_top.push(sides)
            model.edges.push(c_bottom)
            model.edges.push(c_top)

            scene.models[i] = model;

        } else if (ogmodel.type == 'sphere') {

        }

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
    let result = {
        pt0: Vector4(line.pt0.x, line.pt0.y, line.pt0.z, 1),
        pt1: Vector4(line.pt1.x, line.pt1.y, line.pt1.z, 1)
    };

    let pt0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let pt1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(result.pt0);
    let out1 = outcodeParallel(result.pt1);
    let bitwiseOR = out0 | out1;
    let bitwiseAND = out0 & out1;
    
    //let i = 0;
    // TODO: implement clipping here!
    while(true) { 
            out0 = outcodeParallel(result.pt0);
            out1 = outcodeParallel(result.pt1);
            bitwiseOR = out0 | out1;
            bitwiseAND = out0 & out1;

        if(bitwiseOR == 0) {
            break;
        } else if (bitwiseAND != 0) {
            return null;
        } else { // We know at least one of the points are out of bounds
    
            //Determining which outcode we deal with first
            let outcode;
            let holderpt;
            if(out0 != 0) {
                outcode = out0;
                holderpt = pt0;
            } else {
                outcode = out1;
                holderpt = pt1;
            }

            let t = 0;
            //Just to simplify expressions
            let deltax = pt1.x - pt0.x;
            let deltay = pt1.y - pt0.y;
            let deltaz = pt1.z - pt0.z;
            if(outcode & LEFT) {
                t = (-1 - pt0.x)/ deltax;
                
            } else if (outcode & RIGHT) {
                t = (1 - pt0.x)/ deltax;

            } else if (outcode & BOTTOM) {
                t = (-1 - pt0.y)/ deltay;

            } else if (outcode & TOP) {
                t = (1 - pt0.y)/ deltay;

            } else if (outcode & NEAR) {
                t = ( -pt0.z)/ deltaz;

            } else if (outcode & FAR) {
                t = (-pt0.z - 1)/(deltaz);
                
            }

            holderpt.x = ((1-t) * pt0.x) + (t * pt1.x);
            holderpt.y = ((1-t) * pt0.y) + (t * pt1.y);
            holderpt.z = ((1-t) * pt0.z) + (t * pt1.z);
            
            if(outcode == out1) {
                result.pt1.x = holderpt.x;
                result.pt1.y = holderpt.y;
                result.pt1.z = holderpt.z;

            } else if (outcode == out0) {
                result.pt0.x = holderpt.x;
                result.pt0.y = holderpt.y;
                result.pt0.z = holderpt.z;

            } 
        }
    }
    
    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    //Case 2 and default

    let result = {
        pt0: Vector4(line.pt0.x, line.pt0.y, line.pt0.z, 1),
        pt1: Vector4(line.pt1.x, line.pt1.y, line.pt1.z, 1)
    };

    let pt0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let pt1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(pt0, z_min);
    let out1 = outcodePerspective(pt1, z_min);

    let bitwiseOR = out0 | out1;
    let bitwiseAND = out0 & out1;
    
    //let i = 0;
    // TODO: implement clipping here!
    while(true) { 
            out0 = outcodePerspective(result.pt0, z_min)
            out1 = outcodePerspective(result.pt1, z_min)
            bitwiseOR = out0 | out1;
            bitwiseAND = out0 & out1;

        if(bitwiseOR == 0) {
            break;
        } else if (bitwiseAND != 0) {
            return null;
        } else { // We know at least one of the points are out of bounds
    
            //Determining which outcode we deal with first
            let outcode;
            let holderpt;
            if(out0 != 0) {
                outcode = out0;
                holderpt = pt0;
            } else {
                outcode = out1;
                holderpt = pt1;
            }

            

            let t = 0;
            //Just to simplify expressions
            let deltax = pt1.x - pt0.x;
            let deltay = pt1.y - pt0.y;
            let deltaz = pt1.z - pt0.z;
            if(outcode & LEFT) {
                t = (-pt0.x + pt0.z)/(deltax - deltaz);
                //holderpt.x = ((1-t) * pt0.x) + (t * pt1.x);
                
            } else if (outcode & RIGHT) {
                t = (pt0.x + pt0.z)/(-deltax - deltaz);
                //holderpt.x = ((1-t) * pt0.x) + (t * pt1.x);

            } else if (outcode & BOTTOM) {
                t = (-pt0.y + pt0.z)/(deltay - deltaz);
                //holderpt.y = ((1-t) * pt0.y) + (t * pt1.y);

            } else if (outcode & TOP) {
                t = (pt0.y + pt0.z)/(-deltay - deltaz);
                //holderpt.y = ((1-t) * pt0.y) + (t * pt1.y);

            } else if (outcode & NEAR) {
                t = (pt0.z - z_min)/(-deltaz);
                //holderpt.z = ((1-t) * pt0.z) + (t * pt1.z);

            } else if (outcode & FAR) {
                t = (-pt0.z -1)/(deltaz);
                //holderpt.z = ((1-t) * pt0.z) + (t * pt1.z);
                
            }

            holderpt.x = ((1-t) * pt0.x) + (t * pt1.x);
            holderpt.y = ((1-t) * pt0.y) + (t * pt1.y);
            holderpt.z = ((1-t) * pt0.z) + (t * pt1.z);
            
            if(outcode == out1) {
                result.pt1.x = holderpt.x;
                result.pt1.y = holderpt.y;
                result.pt1.z = holderpt.z;

            } else if (outcode == out0) {
                result.pt0.x = holderpt.x;
                result.pt0.y = holderpt.y;
                result.pt0.z = holderpt.z;

            } 
        }
    }
    
    return result;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {
    let translate,rotate, srpMat, matrix;

    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            scene.view.srp.y = scene.view.srp.y-2;
            /*translate = new Matrix(4, 4);
            mat4x4Translate(translate, scene.view.prp.x, scene.view.prp.y, scene.view.prp.z)
            rotate = new Matrix(4, 4);
            mat4x4RotateY(rotate, Math.PI/10);

            srpMat = new Matrix(4, 1);
            srpMat.values = [   [scene.view.srp.x],
                                [scene.view.srp.y],
                                [scene.view.srp.z],
                                        [1]
            ]

            matrix = Matrix.multiply([rotate, translate, srpMat])
            scene.view.srp = new Vector3(matrix.values[0][0], matrix.values[1][0], matrix.values[2][0])
            */
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            scene.view.srp.y = scene.view.srp.y+2;
            
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
            scene.view.prp.z = scene.view.prp.z - 10;
            scene.view.srp.z = scene.view.srp.z - 10;
            console.log(scene.view.prp.z);
            
            break;
        case 87: // W key
            console.log("W");
            scene.view.prp.z = scene.view.prp.z + 10;
            scene.view.srp.z = scene.view.srp.z + 10;
            console.log(scene.view.prp.z);
            
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
        //newModel();
        
        window.requestAnimationFrame(animate);
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
