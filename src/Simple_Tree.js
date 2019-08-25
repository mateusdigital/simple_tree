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
class Branch
{
    constructor(x, y, size, angle, distanceToRoot)
    {
        this.length = size;
        this.angle  = angle;

        this.distanceToRoot = distanceToRoot;

        this.start  = Math_CreateVector(x, y);
        this.end    = Math_CreateVector(
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

    let h = Math_Map(distanceSoFar, 0, tree[tree.length-1].distanceToRoot, 0, 360);
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
    let generations = Math_RandomInt(GENERATIONS_MIN, GENERATIONS_MAX);
    let size        = Math_Random(SIZE_MIN,        SIZE_MAX);
    let decay       = Math_Random(DECAY_MIN,       DECAY_MAX);
    let angle       = Math_Random(ANGLE_MIN,       ANGLE_MAX);

    tree       = [];
    total_len  = 0;
    forward    = true;
    curr_speed = SPEED_TO_GROW;

    CreateTree(generations, size, decay, angle);
    Log(generations, tree.length);
}

//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
    GenerateTree();
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
Canvas_Setup({
    main_title        : "Simple Trees",
    main_date         : "Jul 19, 2019",
    main_version      : "v0.0.1",
    main_instructions : "<br>Move your mouse closer to the edge to increase speed",
    main_link: "<a href=\"http://stdmatt.com/demos/startfield.html\">More info</a>"
});
