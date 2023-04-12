const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // scene:               object (...see description on Canvas)
    constructor(canvas, scene) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.scene = this.processScene(scene);
        this.enable_animation = false;  // <-- disabled for easier debugging; enable for animation
        this.start_time = null;
        this.prev_time = null;


        this.prp = new Vector3(0, 5, -3);
        this.srp = new Vector3(10, 10, -15);
        this.vup = new Vector3(0, 1, 0);




    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation

        // Firts we need to get some transformations going
        // This should be starigh forward as we just need to import the view from the given file
        // So... We use the mat4x4persepctive as per coincidinky the paramters and names algin

    }
    // TODO rotateLeft
    //
    rotateLeft() {

    }
    // TODO rotateRight
    //
    rotateRight() {

    }
    // TODO moveLeft
    //
    moveLeft() {
        this.prp.x--;
        this.srp.x--; // Opposite of move right

    }
    // TODO moveRight
    //
    moveRight() {
        this.prp.x++;
        this.srp.x++; // <-- You ever thought about starting a Goat Farm in New Zealand?
                        // - Idk... a goat farm seem pretty chill to me. You always have goat cheese on deck
    }
    // TODO moveBackward
    //
    moveBackward() {
        this.prp.z++;
        this.srp.z++;
    }
    // TODO moveForward
    //
    moveForward() {
        this.prp.z--;
        this.srp.z--;
    }
    // TODO draw


    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let n_per_view = mat4x4Perspective(this.prp,
            this.srp, this.vup, [-19, 5, -10, 8, 12, 100]);
        let m_per_view = mat4x4MPer();
        let view_view = mat4x4Viewport(800, 600);

        /*

        Okay GANG

        The plan is simple:

        1) We need to get all the datarooskies from the dataroosky file
        2) Then we need to save the vertices in an array or list whater tf it is called in Javascipt
        3) Then, we need to apply clipping - Yeah that's right.
        // 4) Then we need to multiply that THANG by a view.

         */

        // Step One we call some functions



        // Iterating over ALL models in file
        // for (let model = 0; model < this.scene.models.length; model++) {
        //
        //     let connonical_verts = []; // Oooh Big INteliJ with its Big autocomplete - ": any[]" - I have no idea what the type is gonna be either
        //
        //     for (let vert = 0; vert < this.scene.models[model].vertices.length; vert++) {
        //
        //         let temp_vert = Vector4(this.scene.models[model].vertices[vert].x,
        //                                 this.scene.models[model].vertices[vert].y,
        //                                 this.scene.models[model].vertices[vert].z,
        //                                 this.scene.models[model].vertices[vert].w); // This boy in my DMs think im preeeetttyyyy
        //
        //         connonical_verts[vert] = Matrix.multiply([this.connonical_view, temp_vert]);
        //
        //     }
        //
        //     // TODO Add the clipping...
        //     // TODO Add alteration of viewport
        //
        //     console.log(connonical_verts);
        //
        //     for (let draw = 0; draw < connonical_verts.length; draw+=2) {
        //
        //         this.drawLine(connonical_verts[draw].values[0],
        //                     connonical_verts[draw].values[1],
        //                     connonical_verts[draw+1].values[0],
        //                     connonical_verts[draw+1].values[1]);
        //     }
        //
        //
        // }



        let model = this.scene.models[0];
        let edges = model.edges;
        let vertices = model.vertices;

        for (let edge = 0; edge < edges.length; edge++) {   // Loops Edges

            let cur_edge = edges[edge];

            for (let vert = 0; vert < cur_edge.length-1; vert++) {  // Loops Verts

                let vertice_1_idx = edge[vert];
                let vertice_2_idx = edge[vert + 1];

                // Get the W - haha get it? Get the dub? Like winning? Haha - I'm the best
                let vertice_1_w = Matrix.multiply([n_per_view, vertices[vertice_1_idx]]);
                let vertice_2_w = Matrix.multiply([n_per_view, vertices[vertice_2_idx]]);

                // Do the clippy whippy

                let line = {pt0: vertice_1_w, pt1: vertice_2_w};

                let clipped_line = this.clipLinePerspective(line, 0.1);

                if(clipped_line !== null){
                    // Uhhhh updates the freakinnnn vertices W -- yeaaa yeaaa
                    vertice_1_w = Matrix.multiply([view_view, m_per_view, clipped_line.pt0]);
                    vertice_2_w = Matrix.multiply([view_view, m_per_view, clipped_line.pt1]);

                    // Niceee... now we get ready for some drawin' innit - Bootofwoah
                    let vertice_1 = new Vector3(vertice_1_w.x / vertice_1_w.w, vertice_1_w.y / vertice_1_w.w);
                    let vertice_2 = new Vector3(vertice_2_w.x / vertice_2_w.w, vertice_2_w.y / vertice_2_w.w);


                    this.drawLine(  vertice_1.x,
                        vertice_1.y,
                        vertice_2.x,
                        vertice_2.y);
                }

            }
        }




        /*
        OKay we first need to iterate trhough each model. This can be done via a for loop.
        - Call This Loop 1
        We then need to go through the components of each model. We can do this via another for loop.
        - Call This Loop 2

         */
        // if (this.fuckyou) {
            // Loop 1
            // for (let x = 0; x < this.scene.models.length; x++) {
            //     // Loop 2
            //     for (let y = 0; y < this.scene.models[x].vertices.length-1; y++) {
            //         // console.log(this.scene.models[x].vertices[y].data)
            //         this.drawLine(this.scene.models[x].vertices[y].data[0],
            //             this.scene.models[x].vertices[y].data[1],
            //             this.scene.models[x].vertices[y+1].data[0],
            //             this.scene.models[x].vertices[y+1].data[1]);
            //     }
            // }
            // this.fuckyou = false;
        // }



        // TODO: implement drawing here!
        // For each model
        //   * For each vertex
        //     * transform endpoints to canonical view volume
        //   * For each line segment in each edge
        //     * clip in 3D
        //     * project to 2D
        //     * translate/scale to viewport (i.e. window)
        //     * draw line
    }





    // Get outcode for a vertex
    // vertex:       Vector4 (transformed vertex in homogeneous coordinates)
    // z_min:        float (near clipping plane in canonical view volume)
    outcodePerspective(vertex, z_min) {
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

    // Clip line - should either return a new line (with two endpoints inside view volume)
    //             or null (if line is completely outside view volume)
    // line:         object {pt0: Vector4, pt1: Vector4}
    // z_min:        float (near clipping plane in canonical view volume)
    clipLinePerspective(line, z_min) {
        let result = null;
        let p0 = Vector4(line.pt0.x, line.pt0.y, line.pt0.z, line.pt1.w);
        let p1 = Vector4(line.pt1.x, line.pt1.y, line.pt1.z, line.pt1.w);
        let out0 = this.outcodePerspective(p0, z_min);
        let out1 = this.outcodePerspective(p1, z_min);
        
        // TODO: implement clipping here!

        // Okay okay... Let just define some varibaloes here

        let t;
        let point_out;
        let delta_x;
        let delta_y;
        let delta_z;
        let point;
        let breaker = false;

        let line_out = {pt0: p0, pt1: p1};

        while (true) {
            if (!(out0 | out1)) {
                // Accept
                breaker = true;
                break;
            } else if (out0 & out1) {
                // Reject
                break;
            } else {
                delta_x = p1.x - p0.x;
                delta_y = p1.y - p0.y;
                delta_z = p1.z - p0.z;

                if (out0 > out1) {
                    point_out = out0;
                    point = p0;
                } else {
                    point_out = out1;
                    point = p1;
                }

                if (point_out & TOP) {
                    t = (p0.y + p0.z) / (-delta_y - delta_z);
                } else if (point_out & BOTTOM) {
                    t = (-p0.y + p0.z) / (delta_y - delta_z);
                } else if (point_out & RIGHT) {
                    t = (p0.x + p0.z) / (-delta_x - delta_z);
                } else if (point_out & LEFT) {
                    t = (-p0.x + p0.z) / (delta_x - delta_z);
                } else if (point_out & FAR) {
                    t = (-p0.z - 1) / delta_z;
                } else if (point_out & NEAR) {
                    t = (p0.z - z_min) / -delta_z;
                }

                // Surprsingly all are the same.
                point.x = line.pt0.x + (t * delta_x);
                point.y = line.pt0.y + (t * delta_y);
                point.z = line.pt0.z + (t * delta_z);
            }

            if(point_out === out0) {
                out0 = this.outcodePerspective(lineOut, z_min);
            } else {
                out1 = this.outcodePerspective(lineOut, z_min);
            }

        }

        if (breaker) {
            return line_out;
        }
        return result;

    }
    //
    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.draw();

        // Invoke call for next frame in animation
        if (this.enable_animation) {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateScene(scene) {
        this.scene = this.processScene(scene);
        if (!this.enable_animation) {
            this.draw();
        }
    }

    //
    processScene(scene) {
        let processed = {
            view: {
                prp: Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]),
                srp: Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]),
                vup: Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]),
                clip: [...scene.view.clip]
            },
            models: []
        };

        for (let i = 0; i < scene.models.length; i++) {
            let model = { type: scene.models[i].type };
            if (model.type === 'generic') {
                model.vertices = [];
                model.edges = JSON.parse(JSON.stringify(scene.models[i].edges));
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    model.vertices.push(Vector4(scene.models[i].vertices[j][0],
                                                scene.models[i].vertices[j][1],
                                                scene.models[i].vertices[j][2],
                                                1));
                    if (scene.models[i].hasOwnProperty('animation')) {
                        model.animation = JSON.parse(JSON.stringify(scene.models[i].animation));
                    }
                }
            }
            else {
                model.center = Vector4(scene.models[i].center[0],
                                       scene.models[i].center[1],
                                       scene.models[i].center[2],
                                       1);
                for (let key in scene.models[i]) {
                    if (scene.models[i].hasOwnProperty(key) && key !== 'type' && key != 'center') {
                        model[key] = JSON.parse(JSON.stringify(scene.models[i][key]));
                    }
                }
            }

            model.matrix = new Matrix(4, 4);
            processed.models.push(model);
        }

        return processed;
    }
    
    // x0:           float (x coordinate of p0)
    // y0:           float (y coordinate of p0)
    // x1:           float (x coordinate of p1)
    // y1:           float (y coordinate of p1)
    drawLine(x0, y0, x1, y1) {
        this.ctx.strokeStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x0 - 2, y0 - 2, 4, 4);
        this.ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    }
};
