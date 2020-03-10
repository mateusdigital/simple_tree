//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Simple_Tree.js                                                //
//  Project   : stdmatt-demos                                                 //
//  Date      : 19 Jul, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//   Creates a random fractal tree.                                           //
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
let tree       = [];
let total_len  = 0;
let forward    = true;
let curr_speed = 0;


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
}

function CreateTree(generations, size, decay, angle)
{
    let x = 0;
    let y = Canvas_Edge_Bottom;

    tree.push(new Branch(x, y, size, -90, 0));
    generations = Math.pow(2, generations) -1;
    for(let i = 0; i < tree.length; ++i) {
        --generations;
        if(generations < 0) {
            break;
        }

        var t            = tree[i];
        var new_size     = t.length * (1 - decay);
        var dist_to_root = t.distanceToRoot + t.length;

        let l = new Branch(t.end.x, t.end.y, new_size, t.angle + angle, dist_to_root);
        let r = new Branch(t.end.x, t.end.y, new_size, t.angle - angle, dist_to_root);

        tree.push(l);
        tree.push(r);
    }
}

function DrawBranch(b, distanceSoFar)
{
    let len = b.length;
    let ang = b.angle;

    let x1 = b.start.x;
    let y1 = b.start.y;

    let l = (distanceSoFar- b.distanceToRoot) / (b.length);
    if(l > 1 ) {
        l = 1;
    }

    let x2 = x1 + (len * l) * Math.cos(ang * Math.PI / 180);
    let y2 = y1 + (len * l) * Math.sin(ang * Math.PI / 180);

    let h   = Math_Map(distanceSoFar, 0, tree[tree.length-1].distanceToRoot, 0, 360);
    let rgb = hslToRgb(h / 360, 0.5, 0.5);
    let s = "rgb(" + rgb[0] + ","
                   + rgb[1] + ","
                   + rgb[2] + ")"

    Canvas_SetStrokeStyle(s);
    Canvas_SetStrokeSize (4);

    Canvas_DrawLine(x1, y1, x2, y2);
}




function GenerateTree()
{
    let generations = Random_Int   (GENERATIONS_MIN, GENERATIONS_MAX);
    let size        = Random_Number(SIZE_MIN,        SIZE_MAX);
    let decay       = Random_Number(DECAY_MIN,       DECAY_MAX);
    let angle       = Random_Number(ANGLE_MIN,       ANGLE_MAX);

    tree       = [];
    total_len  = 0;
    forward    = true;
    curr_speed = SPEED_TO_GROW;

    CreateTree(generations, size, decay, angle);
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

    const ratio = min_side / max_side;

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


    GenerateTree();
    Canvas_Draw(0);
}




//------------------------------------------------------------------------------
function Draw(dt)
{
    Canvas_ClearWindow("black")
    let change = (dt * curr_speed);
    if(!forward) {
        change *= -1;
    }

    total_len += change;
    for(let i = 0; i < tree.length; ++i) {
        if(total_len >= tree[i].distanceToRoot) {
            DrawBranch(tree[i], total_len);
        }
    }

    if(forward && total_len >= tree[tree.length-1].distanceToRoot * 1.2) {
        forward = false;
        curr_speed = 500;
    } else if(!forward  && total_len <= 0) {
        GenerateTree();
    }
}


//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
Setup();
