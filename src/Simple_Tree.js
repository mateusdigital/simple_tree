//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Simple_Tree.js                                                //
//  Project   : simple_tree                                                   //
//  Date      : Aug 25, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt 2019, 2020                                            //
//                                                                            //
//  Description :                                                             //
//                                                                            //
//---------------------------------------------------------------------------~//

//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
const GENERATIONS_MIN = 5;
const GENERATIONS_MAX = 7;
const SIZE_MIN        = 100;

const SIZE_MAX        = 180;
const DECAY_MIN       = 0.7;
const DECAY_MAX       = 0.9;
const ANGLE_MIN       = 10;
const ANGLE_MAX       = 30;

const ANIM_GROW_DURATION_MIN = 1500;
const ANIM_GROW_DURATION_MAX = 3500;

const MAX_TREES_COUNT = 4;


//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
var background_color = chroma.rgb(221, 227, 213).name()
var trees            = [];

//----------------------------------------------------------------------------//
// Classes                                                                    //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
class Branch
{
    //--------------------------------------------------------------------------
    constructor(
        x,
        y,
        currentSize,
        currentAngle,
        distanceToRoot,
        currentGeneration,
        maxGenerations)
    {
        // Position / Size / Color
        this.curr_angle       = currentAngle;
        this.curr_size        = currentSize;
        this.distance_to_root = distanceToRoot + currentSize;

        this.start = Vector_Create(x, y);
        this.end   = Vector_Create(
            x + (this.curr_size * Math_Cos(Math_Radians(this.curr_angle))),
            y + (this.curr_size * Math_Sin(Math_Radians(this.curr_angle)))
        );

        this.color = chroma.rgb(102, 80, 93).name();

        // Generation.
        this.curr_generation  = currentGeneration;
        this.max_generations  = maxGenerations;

        // Animation.
        this.anim_grow_duration = Random_Int(
            ANIM_GROW_DURATION_MIN,
            ANIM_GROW_DURATION_MAX
        );
        this.anim_grow_tween = Tween_CreateBasic(this.anim_grow_duration)
            .onComplete(()=>{
                this._CreateSubBranch();
            });

        if(this.curr_generation == 0) {
            this.anim_grow_tween.delay(Random_Int(100, 4000))
        }
        this.anim_grow_tween.start();

        // Subbranches
        this.branches = [];
    } // CTOR

    //--------------------------------------------------------------------------
    Draw(dt)
    {
        const  t = this.anim_grow_tween.getValue().value;
        const x1 = this.start.x;
        const y1 = this.start.y;

        const x2 = Math_Lerp(x1, this.end.x, t);
        const y2 = Math_Lerp(y1, this.end.y, t);

        // @notice(stdmatt): спасибо моей хорошей жене that at very early in the
        // morning just said how I should make the branches thicker near to the
        // root ;D
        Canvas_SetStrokeStyle(this.color);
        Canvas_SetStrokeSize((this.max_generations / (this.curr_generation + 1)))
        Canvas_DrawLine(x1, y1, x2, y2);

        for(let i = 0; i < this.branches.length; ++i) {
            this.branches[i].Draw(dt);
        }
    } // Draw

    //--------------------------------------------------------------------------
    _CreateSubBranch()
    {
        if(this.curr_generation < this.max_generations) {
            const new_generation = this.curr_generation + 1;
            // @improve(stdmatt): This way we make the branches to grow bigger
            // slightly to the left... Can be improved...
            const t1 = Random_Number(0.6, 1);
            const t2 = Random_Number(t1, 1);

            const left_branch = new Branch(
                Math_Lerp(this.start.x, this.end.x, t1),
                Math_Lerp(this.start.y, this.end.y, t1),
                this.curr_size  * Random_Number(DECAY_MIN, DECAY_MAX),
                this.curr_angle - Random_Number(ANGLE_MIN, ANGLE_MAX),
                this.distance_to_root,
                new_generation,
                this.max_generations
            );

            const right_branch = new Branch(
                Math_Lerp(this.start.x, this.end.x, t2),
                Math_Lerp(this.start.y, this.end.y, t2),
                this.curr_size  * Random_Number(DECAY_MIN, DECAY_MAX),
                this.curr_angle + Random_Number(ANGLE_MIN, ANGLE_MAX),
                this.distance_to_root,
                new_generation,
                this.max_generations
            );

            this.branches.push(left_branch );
            this.branches.push(right_branch);
        }
    } // _CreateSubBranch
}; // class Branch


//------------------------------------------------------------------------------
class Tree
{
    //--------------------------------------------------------------------------
    constructor(x)
    {
        const desired_size    = Random_Int(SIZE_MIN,  SIZE_MAX);
        const max_generations = Random_Int(GENERATIONS_MIN, GENERATIONS_MAX);

        this.branch = new Branch(
            x,
            Canvas_Edge_Bottom,
            desired_size,
            -90 +  Random_Number(-10, +10),
            0, // distance to root
            0, // current generation
            max_generations
        );
    } // CTOR

    //--------------------------------------------------------------------------
    Draw(dt)
    {
        this.branch.Draw(dt);
    } // Draw
}; // class Tree

//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
    const seed = null;
    Random_Seed(seed);

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

    //
    // Add the information.
    const info = document.createElement("p");
    info.innerHTML = String_Cat(
        "Simple Tree", "<br>",
        "Aug 25, 2019", "<br>",
        GetVersion(),   "<br>",
        "<a href=\"http://stdmatt.com/demos/simple_tree.html\">More info</a>"
    );
    parent.appendChild(info);

    //
    // Create the Trees.
    const tree_root_space = (Canvas_Half_Width * 0.8);
    const trees_count     = Random_Int(1, MAX_TREES_COUNT);
    for(let i = 0; i < trees_count; ++i) {
        const tree_root_x = Random_Int(-tree_root_space, +tree_root_space);
        trees.push(new Tree(tree_root_x));
    }

    //
    // Start the Simulation.
    Canvas_Start();
}

//------------------------------------------------------------------------------
function Draw(dt)
{
    Canvas_ClearWindow(background_color);

    Tween_Update(dt);
    for(let i = 0; i < trees.length; ++i) {
        const tree = trees[i];
        tree.Draw(dt);
    }
}


//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
Setup();
