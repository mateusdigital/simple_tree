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

const MIN_TREES_COUNT = 3;
const MAX_TREES_COUNT = 7;

//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
var background_color = "black";
var tree_color       = "blue";
var trees            = [];


//----------------------------------------------------------------------------//
// Helper Functions                                                           //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function CreateTree()
{
    const tree_root_space = (get_canvas_width() * 0.5 * 0.8);
    const tree_root_x = random_int(-tree_root_space, +tree_root_space);
    trees.push(new Tree(tree_root_x));
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
        this.anim_grow_tween = Tween.create(
            this.anim_grow_duration,
            this.parent_tree.anim_grow_group
        )
        .on_complete(()=>{
            this._CreateSubBranch();
        });

        if(this.curr_generation == 0) {
            this.anim_grow_tween.delay(random_int(100, 4000))
        }
        this.anim_grow_tween.start();

        // Subbranches
        this.branches = [];
    } // CTOR

    //--------------------------------------------------------------------------
    Draw(dt)
    {
        const  t = this.anim_grow_tween.get_value().value;
        const x1 = this.start.x;
        const y1 = this.start.y;

        const x2 = lerp(x1, this.end.x, t);
        const y2 = lerp(y1, this.end.y, t);

        set_canvas_line_width(this.parent_tree.max_generations / (this.curr_generation + 1));
        draw_line(x1, y1, x2, y2);

        for(let i = 0; i < this.branches.length; ++i) {
            this.branches[i].Draw(dt);
        }
    } // Draw

    //--------------------------------------------------------------------------
    _CreateSubBranch()
    {
        if(this.curr_generation >= this.parent_tree.max_generations) {
            return;
        }

        const new_generation = this.curr_generation + 1;
        // @improve(stdmatt): This way we make the branches to grow bigger
        // slightly to the left... Can be improved...
        const t1 = random_float(0.6, 1);
        const t2 = random_float(t1, 1);

        const left_branch = new Branch(
            lerp(this.start.x, this.end.x, t1),
            lerp(this.start.y, this.end.y, t1),
            this.curr_size  * random_float(DECAY_MIN, DECAY_MAX),
            this.curr_angle - random_float(ANGLE_MIN, ANGLE_MAX),
            new_generation,
            this.parent_tree
        );

        const right_branch = new Branch(
            lerp(this.start.x, this.end.x, t2),
            lerp(this.start.y, this.end.y, t2),
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
        this.is_done         = false;

        // Animations.
        this.anim_grow_group = Tween.create_with_group()
            .on_complete(()=>{
                this.anim_die_tween.start();
            });

        // @todo(stdmatt): Remove magic numbers...
        this.anim_die_tween = Tween.create(random_int(1000, 3000))
            .delay(random_int(500, 2500))
            .on_update((v)=>{
                this.color = this.color.alpha(1 - v.value)
            })
            .on_complete(()=>{
                this.is_done = true;
            })

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
        set_canvas_stroke(this.color)
        this.anim_grow_group.update();
        this.branch.Draw(dt);
    } // Draw

    //--------------------------------------------------------------------------
    StartToDie()
    {
        this.is_dying = true;
    } // StartToDie
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
    set_canvas_fill("white");

    //
    // Create the Trees.
    const trees_count = random_int(MIN_TREES_COUNT, MAX_TREES_COUNT);
    for(let i = 0; i < trees_count; ++i) {
        CreateTree();
    }

    translate_canvas_to_center();
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
    clear_canvas();

    begin_draw();
        Tween_Group._default_group.update();
        // Tween_Update(dt);
        for(let i = trees.length -1; i >= 0; --i) {
            const tree = trees[i];
            if(tree.is_done) {
                Array_RemoveAt(trees, i);
                CreateTree();

                continue;
            }
            tree.Draw(dt);
        }
    end_draw();
}
