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


 /*
    Tested reference perspective model; Working properly
    let testPRP = new Vector3(0,10,-5);
    let testSRP = new Vector3(20,15,-40);
    let testVUP = new Vector3(1,1,0);
    let testClip = [-12,6,-12,6,10,100];
    let res = mat4x4Perspective(testPRP, testSRP, testVUP, testClip);
 */
    // Testing binary output for the clipping function
    let num = 62;
    let binary = outcodeToBinary(num);
    console.log(binary);
    console.log(checkLeftOut(binary));
    console.log(checkRightOut(binary));
    console.log(checkBottomOut(binary));
    console.log(checkTopOut(binary));
    console.log(checkFarOut(binary));
    console.log(checkNearOut(binary));

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

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    console.log(scene);
    // TODO: implement drawing here!
    // For each model, for each edge
    //  * transform to canonical view volume
    //  * clip in 3D
    //  * project to 2D
    //  * draw line
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
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.x > (0.0 + FLOAT_EPSILON)) {
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
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.x > (z_min + FLOAT_EPSILON)) {
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
    let result = null;
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z); 
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);

    // TODO: implement clipping here!
    // Convert the 2 given outcode into binary form
    let out0Binary = outcodeToBinary(out0);
    let out1Binary = outcodeToBinary(out1);
    // TODO: Compare the 2 binary outcodes and check for the different clipping cases
    let sequence = null;
    // Check LEFT plane

    return result;
}

// Tentative, not sure if this will work
/**
 * This function is given the bits of the 2 outcodes and the line vertices. It uses the 2
 * outcodes to compare and contrast for the 4 different cases of clipping afterward it would output
 * sequence of point or points that is clipped.
 * @param out0 the given bit of the first outcode
 * @param out1 the given bit of the second outcode
 * @param p0 the first point from the given line
 * @param p1 the second point from the given line
 * @return outSequence will either be null, a point, or two points depending on the cases
 */
function updateClipPerspective(out0, out1, p0, p1) {
    let outSequence = null;
    let cases = null;

    // case 1; Trivial accept; bit: 0 | 0 == 0
    if(out0 == 0 && out1 == 0) {
        cases = "zeros";
    }

    // case 2; Trivial reject; bit: 1 & 1 != 0
    if(out0 == 1 && out1 == 1) {
        cases = "ones";
    }

    // case 3; Investigate further; bit = 0 1
    if(out0 == 0 && out1 == 1) {
        cases = "zeroOne";
    }

    // case 4; Investigate further; bit = 1 0
    if(out0 == 1 && out1 == 0) {
        cases = "oneZero";
    }

    switch (cases) {
        case "zeros":
            // TODO: add p1 to output sequence
            break;
        case "ones":
            line = null;
            break;
        case "zeroOne":
            // TODO: add intersection point to sequence
            break;
        case "oneZero":
            // TODO: add intersection point and p1 to sequence
    }
}

/**
 * This function return the binary string of a given outcode. It also ensure that the length of the string
 * is equal to 6, otherwise, insert 0 to the front of the string
 * @param out the given outcode to convert into binary
 * @return the binary string of the given outcode
 */
function outcodeToBinary(out) {
    let binary = out.toString(2);
    while(binary.length < 6) {
        binary = 0 + binary;
    }
    return binary;
}

/**
 * This function return 1 if the given vertex has a LEFT outcode
 * @param binaryOut the given binary string used to compare for the LEFT outcode
 * @return 1 if it has a LEFT outcode and 0 otherwise
 */
function checkLeftOut(binaryOut) {
    let output = 0;
    if(binaryOut.charAt(0) == 1) {
        output = 1;
    }
    return output;
}

/**
 * This function return 1 if the given vertex has a RIGHT outcode
 * @param binaryOut the given binary string used to compare for the RIGHT outcode
 * @return 1 if it has a RIGHT outcode and 0 otherwise
 */function checkRightOut(binaryOut) {
    let output = 0;
    if(binaryOut.charAt(1) == 1) {
        output = 1;
    }
    return output;
 }

/**
 * This function return 1 if the given vertex has a BOTTOM outcode
 * @param binaryOut the given binary string used to compare for the BOTTOM outcode
 * @return 1 if it has a BOTTOM outcode and 0 otherwise
 */
function checkBottomOut(binaryOut) {
    let output = 0;
    if(binaryOut.charAt(2) == 1) {
        output = 1;
    }
    return output;
}

/**
 * This function return 1 if the given vertex has a TOP outcode
 * @param binaryOut the given binary string used to compare for the TOP outcode
 * @return 1 if it has a TOP outcode and 0 otherwise
 */
function checkTopOut(binaryOut) {
    let output = 0;
    if(binaryOut.charAt(3) == 1) {
        output = 1;
    }
    return output;
}

/**
 * This function return 1 if the given vertex has a FAR outcode
 * @param binaryOut the given binary string used to compare for the FAR outcode
 * @return 1 if it has a FAR outcode and 0 otherwise
 */
function checkFarOut(binaryOut) {
    let output = 0;
    if(binaryOut.charAt(4) == 1) {
        output = 1;
    }
    return output;
}

/**
 * This function return 1 if the given vertex has a NEAR outcode
 * @param binaryOut the given binary string used to compare for the NEAR outcode
 * @return 1 if it has a NEAR outcode and 0 otherwise
 */
function checkNearOut(binaryOut) {
    let output = 0;
    if(binaryOut.charAt(5) == 1) {
        output = 1;
    }
    return output;
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
            break;
        case 68: // D key
            console.log("D");
            break;
        case 83: // S key
            console.log("S");
            break;
        case 87: // W key
            console.log("W");
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
