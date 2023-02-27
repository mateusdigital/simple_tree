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
//  Copyright : stdmatt 2019, 2020, 2023                                      //
//                                                                            //
//  Description :                                                             //
//                                                                            //
//---------------------------------------------------------------------------~//


//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
__SOURCES = [
    "/modules/demolib/modules/external/chroma.js",
    "/modules/demolib/modules/external/gif.js/gif.js",

    "/modules/demolib/source/demolib.js",
];

//------------------------------------------------------------------------------
const GENERATIONS_MIN = 3;
const GENERATIONS_MAX = 9;
const SIZE_MIN        = 100;
const SIZE_MAX        = 250;
const DECAY_MIN       = 0.7;
const DECAY_MAX       = 0.9;
const ANGLE_MIN       = 10;
const ANGLE_MAX       = 30;

const ANIM_GROW_DURATION_MIN = 1.5;
const ANIM_GROW_DURATION_MAX = 5.5;

const MIN_TREES_COUNT = 3;
const MAX_TREES_COUNT = 7;

//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
const background_color = "#eee8d5";
const tree_color       = "#58564f";
const trees            = [];


//----------------------------------------------------------------------------//
// Helper Functions                                                           //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function CreateTree()
{
    const width       = get_canvas_width();
    const tree_root_x = random_int(width * 0.1, width * 0.9);
    const tree        = new Tree(tree_root_x);

    trees.push(tree);
}


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
        currentGeneration,
        parentTree)
    {
        // Parent Tree
        this.parent_tree = parentTree;
        this.parent_tree.is_done = false;

        // Position / Size / Color
        this.curr_angle = currentAngle;
        this.curr_size  = currentSize;

        this.start = make_vec2(x, y);
        this.end   = make_vec2(
            x + (this.curr_size * Math.cos(to_radians(this.curr_angle))),
            y + (this.curr_size * Math.sin(to_radians(this.curr_angle)))
        );

        // Generation.
        this.curr_generation = currentGeneration;

        // Animation.
        this.anim_grow_duration = random_int(
            ANIM_GROW_DURATION_MIN,
            ANIM_GROW_DURATION_MAX
        );

        const delay_ = random_float(0, 1);
        this.anim_grow_tween = Tween.create(this.anim_grow_duration)
            .delay(delay_) // Delay the start...
            .on_complete(()=>{
                this._CreateSubBranch();
            })

        this.anim_grow_tween.start();

        // Subbranches
        this.branches = [];
    } // CTOR

    //--------------------------------------------------------------------------
    Draw(dt)
    {
        this.anim_grow_tween.update();

        const  t = this.anim_grow_tween.get_ratio();
        const x1 = this.start.x;
        const y1 = this.start.y;

        const x2 = lerp(t, x1, this.end.x);
        const y2 = lerp(t, y1, this.end.y);

        set_canvas_stroke(tree_color);
        set_canvas_line_width(this.parent_tree.max_generations / (this.curr_generation + 1));
        draw_line(x1, y1, x2, y2);

        for(let i = 0; i < this.branches.length; ++i) {
            this.branches[i].Draw(dt);
        }

        if(t < 1) {
            this.parent_tree.is_done = false;
        }

        if(this.parent_tree.is_dying) {

            this.start.y += dt * (random_float(50, 80) * (this.curr_generation + 1));
            this.end.y   += dt * (random_float(50, 80) * (this.curr_generation + 1));

            const height  = get_canvas_height();
            if(this.end.y < height) {
                this.parent_tree.is_done = false;
            }
        }
    } // Draw

    //--------------------------------------------------------------------------
    _CreateSubBranch()
    {
        if(this.curr_generation >= this.parent_tree.max_generations) {
            this.parent_tree.is_dying = true;
            return;
        }

        const new_generation = this.curr_generation + 1;
        // @improve(stdmatt): This way we make the branches to grow bigger
        // slightly to the left... Can be improved...
        const t1 = random_float(0.6, 1);
        const t2 = random_float(t1, 1);

        const left_branch = new Branch(
            lerp(t1, this.start.x, this.end.x),
            lerp(t1, this.start.y, this.end.y),
            this.curr_size  * random_float(DECAY_MIN, DECAY_MAX),
            this.curr_angle - random_float(ANGLE_MIN, ANGLE_MAX),
            new_generation,
            this.parent_tree
        );

        const right_branch = new Branch(
            lerp(t2, this.start.x, this.end.x),
            lerp(t2, this.start.y, this.end.y),
            this.curr_size  * random_float(DECAY_MIN, DECAY_MAX),
            this.curr_angle + random_float(ANGLE_MIN, ANGLE_MAX),
            new_generation,
            this.parent_tree
        );

        this.branches.push(left_branch );
        this.branches.push(right_branch);
    } // _CreateSubBranch
}; // class Branch


//------------------------------------------------------------------------------
class Tree
{
    //--------------------------------------------------------------------------
    constructor(x)
    {
        this.max_generations = random_int(GENERATIONS_MIN, GENERATIONS_MAX);
        this.color           = chroma(tree_color);
        this.is_done         = true;

        // Animations.
        this.branch = new Branch(
            x,
            get_canvas_height(),
            random_int(SIZE_MIN,  SIZE_MAX),
            -90 +  random_float(-10, +10),
            0, // current generation
            this
        );
    } // CTOR

    //--------------------------------------------------------------------------
    Draw(dt)
    {
        this.is_done = true;
        this.branch.Draw(dt);
    } // Draw
}; // class Tree

//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function setup_standalone_mode()
{
    return new Promise((resolve, reject)=>{
        demolib_load_all_scripts(__SOURCES).then(()=> { // Download all needed scripts.
            // Create the standalone canvas.
            const canvas = document.createElement("canvas");

            canvas.width            = window.innerWidth;
            canvas.height           = window.innerHeight;
            canvas.style.position   = "fixed";
            canvas.style.left       = "0px";
            canvas.style.top        = "0px";
            canvas.style.zIndex     = "-100";

            document.body.appendChild(canvas);

            // Setup the listener for gif recording.
            gif_setup_listeners();

            resolve(canvas);
        });
    });
}

//------------------------------------------------------------------------------
function setup_common(canvas)
{
    set_random_seed();

    set_main_canvas(canvas);

    //
    // Create the Trees.
    const trees_count = random_int(MIN_TREES_COUNT, MAX_TREES_COUNT);
    for(let i = 0; i < trees_count; ++i) {
        CreateTree();
    }

    start_draw_loop(draw);
}



//------------------------------------------------------------------------------
function demo_main(user_canvas)
{
    if(!user_canvas) {
        setup_standalone_mode().then((canvas)=>{
            setup_common(canvas);
        });
    } else {
        canvas = user_canvas;
        setup_common();
    }

}

//------------------------------------------------------------------------------
function draw(dt)
{
    clear_canvas(background_color);
    begin_draw();
        for(let i = trees.length -1; i >= 0; --i) {
            const tree = trees[i];
            if(tree.is_done) {
                trees.splice(i, 1);
                CreateTree();

                continue;
            }
            tree.Draw(dt);
        }
    end_draw();
}
