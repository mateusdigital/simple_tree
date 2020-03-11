//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Simple_this.branches.js                                                //
//  Project   : stdmatt-demos                                                 //
//  Date      : 19 Jul, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//   Creates a random fractal this.branches.                                           //
//---------------------------------------------------------------------------~//

//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
const GENERATIONS_MIN = 5;
const GENERATIONS_MAX = 7;
const SIZE_MIN        = 150;
const SIZE_MAX        = 180;
const DECAY_MIN       = 0.7;
const DECAY_MAX       = 0.9;
const ANGLE_MIN       = 10;
const ANGLE_MAX       = 30;

const SPEED_TO_GROW = 150;


//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
var trees = null;


//----------------------------------------------------------------------------//
// Helper Functions                                                           //
//----------------------------------------------------------------------------//
function CreateVector(x, y)
{
    return {x:x, y:y};
}
function hslToRgb(h, s, l)
{
    return [255, 255, 255, 255]
}


class Branch
{
    constructor(
        x,
        y,
        currentSize,
        currentAngle,
        distanceToRoot,
        currentGeneration,
        maxGenerations)
    {
        this.curr_angle       = currentAngle;
        this.curr_size        = currentSize;
        this.curr_generation  = currentGeneration;
        this.distance_to_root = distanceToRoot + currentSize;

        this.start = CreateVector(x, y);
        this.end   = CreateVector(
            x + (this.curr_size * Math.cos(this.curr_angle * Math.PI / 180)),
            y + (this.curr_size * Math.sin(this.curr_angle * Math.PI / 180))
        );

        this.branches = [];

        if(this.curr_generation < maxGenerations) {
            const new_generation = this.curr_generation + 1;
            let l = new Branch(
                this.end.x,
                this.end.y,
                this.curr_size  * Random_Number(DECAY_MIN, DECAY_MAX),
                this.curr_angle - Random_Number(ANGLE_MIN, ANGLE_MAX),
                this.distance_to_root,
                new_generation,
                maxGenerations
            );
            let r = new Branch(
                this.end.x,
                this.end.y,
                this.curr_size  * Random_Number(DECAY_MIN, DECAY_MAX),
                this.curr_angle + Random_Number(ANGLE_MIN, ANGLE_MAX),
                this.distance_to_root,
                new_generation,
                maxGenerations
            );

            this.branches.push(l);
            this.branches.push(r);
        }
       this.color = "white"; chroma.random().name();

    }

    Draw(dt)
    {
        let len = this.curr_size;
        let ang = this.curr_angle;

        let x1 = this.start.x;
        let y1 = this.start.y;

        let l = (/* distanceSoFar - */ this.distance_to_root) / (this.curr_size);
        if(l > 1 ) {
            l = 1;
        }

        let x2 = x1 + (len * l) * Math.cos(ang * Math.PI / 180);
        let y2 = y1 + (len * l) * Math.sin(ang * Math.PI / 180);

        let thickness = Math_Map(this.distance_to_root, 0, 400, 6, 1)
        Canvas_SetStrokeStyle(this.color);
        Canvas_SetStrokeSize (thickness);

        Canvas_DrawLine(x1, y1, x2, y2);

        for(let i = 0; i < this.branches.length; ++i) {
            this.branches[i].Draw(dt);
        }
    }
}

class Tree
{
    constructor(x)
    {
        const desired_size    = Random_Number(SIZE_MIN,  SIZE_MAX);
        const max_generations = Random_Int   (GENERATIONS_MIN, GENERATIONS_MAX);

        this.branch = new Branch(
            x,
            Canvas_Edge_Bottom,
            desired_size,
            -90,
            0, // distance to root
            0, // current generation
            max_generations
        );


    }

    Draw(dt)
    {
        this.branch.Draw(dt);
    }
}

//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
    Random_Seed(null);

    //
    // Configure the Canvas.
    const parent        = document.getElementById("canvas_div");
    const parent_width  = parent.clientWidth;
    const parent_height = parent.clientHeight;

    const max_side = Math_Max(parent_width, parent_height);
    const min_side = Math_Min(parent_width, parent_height);
    const ratio    = (min_side / max_side);

    // Landscape
    if(parent_width > parent_height) {
        Canvas_CreateCanvas(800, 800 * ratio, parent);
    }
    // Portrait
    else {
        Canvas_CreateCanvas(800 * ratio, 800, parent);
    }

    Canvas.style.width  = "100%";
    Canvas.style.height = "100%";

    trees = [];
    trees.push(new Tree(0));

    Canvas_Draw(0);
}




//------------------------------------------------------------------------------
function Draw(dt)
{
    Canvas_ClearWindow("black")
    for(let i = 0; i < trees.length; ++i) {
        let tree = trees[i];
        tree.Draw  (dt);
    }
}


//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
Setup();
