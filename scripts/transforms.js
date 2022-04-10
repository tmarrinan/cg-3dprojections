// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    //clip = [left, right, bottom, top, near, far]
    //Center of Window
    let CW = {  x:(clip[0] + clip[1])/2,
                y: (clip[2] + clip[3])/2, 
                z:(clip[4] + clip[5])/2 };

    //Direction of Projection CW-prp but prp is 0,0,0 in terms of vrc
    let DOP = Vector4(CW.x, CW.y, CW.z, 1);
    // 1. translate PRP to origin
    let translate = new Matrix(4, 4);
    mat4x4Translate(translate, -prp.x, -prp.y, -prp.z);

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let rotate = new Matrix(4,4);
    rotateXYZ(rotate, prp, srp, vup);

    // 3. shear such that CW is on the z-axis
    let shx = -DOP.x/DOP.z;
    let shy = -DOP.y/DOP.z;
    let shear = new Matrix(4,4);
    mat4x4ShearXY(shear, shx, shy);

     // 4. translate near clipping plane to origin
    let new_translate = new Matrix(4,4);
    mat4x4Translate(new_translate, 0, 0, clip[4]);

    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])
    let sx = 2/(clip[1]-clip[0]);
    let sy = 2/(clip[3]-clip[2]);;
    let sz = 1/clip[5];
    let scale = new Matrix(4,4);
    mat4x4Scale(scale, sx, sy, sz); 
    
    let transform = Matrix.multiply([scale, new_translate, shear, rotate, translate]);
    
    return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    //clip = [left, right, bottom, top, near, far]
    //Center of Window
    let CW = {  x:(clip[0] + clip[1])/2,
                y: (clip[2] + clip[3])/2, 
                z:(clip[4] + clip[5])/2 };

    //Direction of Projection CW-prp but prp is 0,0,0 in terms of vrc
    let DOP = Vector4(CW.x, CW.y, CW.z, 1);
    // 1. translate PRP to origin
    let translate = new Matrix(4, 4);
    mat4x4Translate(translate, -prp.x, -prp.y, -prp.z);

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let rotate = new Matrix(4,4);
    rotateXYZ(rotate, prp, srp, vup);

    // 3. shear such that CW is on the z-axis
    let shx = -DOP.x/DOP.z;
    let shy = -DOP.y/DOP.z;
    let shear = new Matrix(4,4);
    mat4x4ShearXY(shear, shx, shy);
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    let sx = 2*clip[4]/((clip[1]-clip[0])*clip[5]);
    let sy = 2*clip[4]/((clip[3]-clip[2])*clip[5]);;
    let sz = 1/clip[5];
    let scale = new Matrix(4, 4);
    mat4x4Scale(scale, sx, sy, sz); 
    
    let transform = Matrix.multiply([scale, shear, rotate, translate]);
    return transform;
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4MPar() {
    let mpar = new Matrix(4, 4);
    mpar.values =   [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 0, 0],
                     [0, 0, 0, 1]];

    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mper.values = [[1, 0,  0, 0],
                   [0, 1,  0, 0],
                   [0, 0,  1, 0],
                   [0, 0, -1, 0]];
    return mper;
}


function rotateXYZ(mat4x4, prp, srp, vup) {
    let n = prp.subtract(srp);
    n.normalize();
    let v = vup.cross(n);
    v.normalize();
    let u = v.cross(n);
    mat4x4.values=[ [u.x, u.y, u.z, 0],
                    [v.x, v.y, v.z, 0],
                    [n.x, n.y, n.z, 0],
                    [ 0,   0,   0,  0]];
}


///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, tx],
                     [0, 1, 0, ty],
                     [0, 0, 1, tz],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the scale matrix
function mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx, 0, 0, 0],
                     [0, sy, 0, 0],
                     [0,  0, sz, 0],
                     [0,  0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function mat4x4RotateX(mat4x4, theta) {
    let cos = Math.cos(theta);
    let sin = Math.sin(theta);
    mat4x4.values = [[1,  0,   0,     0],
                     [0, cos, -1*sin, 0],
                     [0, sin, cos,    0],
                     [0, 0,    0,     1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function mat4x4RotateY(mat4x4, theta) {
    let cos = Math.cos(theta);
    let sin = Math.sin(theta);
    mat4x4.values = [[cos,    0,  sin, 0],
                     [0,      1,   0,  0],
                     [-1*sin, 0,  cos, 0],
                     [0,      0,   0,  1]];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function mat4x4RotateZ(mat4x4, theta) {
    // mat4x4.values = ...;
    let cos = Math.cos(theta);
    let sin = Math.sin(theta);
    mat4x4.values = [[cos, -1*sin, 0,  0],
                     [sin,  cos,   0,  0],
                     [0,    0,     1,  0],
                     [0,    0,     0,  1]];
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function mat4x4ShearXY(mat4x4, shx, shy) {
    // mat4x4.values = ...;
    mat4x4.values = [[1, 0, shx, 0],
                     [0, 1, shy, 0],
                     [0, 0,  1,  0],
                     [0, 0,  0,  1]];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
