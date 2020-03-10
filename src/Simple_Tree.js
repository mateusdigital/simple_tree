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
const GENERATIONS_MIN = 5
const GENERATIONS_MAX = 10;
const SIZE_MIN        = 80;
const SIZE_MAX        = 180;
const DECAY_MIN       = 0.2;
const DECAY_MAX       = 0.5;
const ANGLE_MIN       = 10
const ANGLE_MAX       = 50;

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
    constructor(x, y, size, angle, distanceToRoot)
    {
        this.length = size;
        this.angle  = angle;

        this.distanceToRoot = distanceToRoot;

        this.start  = CreateVector(x, y);
        this.end    = CreateVector(
            x + (size * Math.cos(angle * Math.PI / 180)),
            y + (size * Math.sin(angle * Math.PI / 180))
        );
    }

    Draw(dt)
    {
        let len = this.length;
        let ang = this.angle;

        let x1 = this.start.x;
        let y1 = this.start.y;

        let l = (/* distanceSoFar - */ this.distanceToRoot) / (this.length);
        if(l > 1 ) {
            l = 1;
        }

        let x2 = x1 + (len * l) * Math.cos(ang * Math.PI / 180);
        let y2 = y1 + (len * l) * Math.sin(ang * Math.PI / 180);

        Canvas_SetStrokeStyle("white");
        Canvas_SetStrokeSize (4);

        Canvas_DrawLine(x1, y1, x2, y2);
    }
}

class Tree
{
    constructor(x)
    {
        this.generations = 1; Random_Int   (GENERATIONS_MIN, GENERATIONS_MAX);
        this.size        = Random_Number(SIZE_MIN,        SIZE_MAX);
        this.decay       = Random_Number(DECAY_MIN,       DECAY_MAX);
        this.angle       = Random_Number(ANGLE_MIN,       ANGLE_MAX);

        this.branches   = [];
        this.forward    = true;
        this.curr_speed = SPEED_TO_GROW;
        this.total_len  = 0;

        // Create the branches.
        this.branches.push(new Branch(x, Canvas_Edge_Bottom, this.size, -90, 0));

        let generations = Math.pow(2, this.generations) -1;
        for(let i = 0; i < this.branches.length; ++i) {
            --generations;
            if(generations < 0) {
                break;
            }

            var branch       = this.branches[i];
            var new_size     = branch.length * (1 - this.decay);
            var dist_to_root = branch.distanceToRoot + branch.length;

            let l = new Branch(branch.end.x, branch.end.y, new_size, branch.angle + this.angle, dist_to_root);
            let r = new Branch(branch.end.x, branch.end.y, new_size, branch.angle - this.angle, dist_to_root);

            this.branches.push(l);
            this.branches.push(r);
        }
    }

    Draw(dt)
    {
        for(let i = 0; i < this.branches.length; ++i) {
            let branch = this.branches[i];
            branch.Draw(dt);
        }
    }
}

//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
    Random_Seed(1);

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
    trees.push(new Tree(Canvas_Half_Width));

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
