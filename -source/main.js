//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Simple_Clock.js                                               //
//  Project   : simple_clock                                                  //
//  Date      : 17 Jul, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt 2019, 2020                                            //
//                                                                            //
//  Description :                                                             //
//   Displays a simple digital / analog clock.                                //
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
const SECONDS_IN_MINUTE     = 60;
const SECONDS_IN_HOUR       = SECONDS_IN_MINUTE * 60;
const SECONDS_IN_DAY        = 60 * 60 * 24;
const STROKE_SIZE           = 10;
const CLOCK_SIZE_MULTIPLIER = 0.9;


//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
let hours       = 0;
let minutes     = 0;
let seconds     = 0;
let total_time  = 0;
let prev_date   = null;
let base_radius = 0;


//----------------------------------------------------------------------------//
// Helper Functions                                                           //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Draw_Arc(value, maxValue, radius, color_a, color_b)
{
    // The shadow arc.
    set_canvas_stroke(color_b);
    draw_arc(0, 0, radius, 0, Math.PI * 2);

    // The actual arc.
    set_canvas_stroke(color_a);
    let s = map_values(value, 0, maxValue, -Math.PI/2, (2 * Math.PI) - Math.PI/2);

    draw_arc(0, 0, radius, -Math.PI/2, s, false);
}


//------------------------------------------------------------------------------
function recalculate_sizes()
{

    const screen_size = Min_Max.from_two_values(
        get_canvas_width(),
        get_canvas_height()
    );

    base_radius = (screen_size.min * 0.5 * CLOCK_SIZE_MULTIPLIER);
    set_canvas_stroke(STROKE_SIZE);


    text_color = "white";
    text_font  = "50px Arial";

    const ctx       = get_main_canvas_context();
    const diagonal  = (base_radius * 1.5);
    const tolerance = 2;

    let min  = 10;
    let max  = 500;
    let curr = (min + max) / 2;

    while(true) {
        curr = to_int(curr);

        ctx.font = `${curr}px Arial`;
        text_size = ctx.measureText("99 : 99 : 99");

        console.log(`${min} - ${max}: ${text_size.width} - ${diagonal} --> ${ctx.font}`)

        const gap     = (text_size.width - diagonal);
        const abs_gap = Math.abs(gap);

        console.log(`${gap} - ${abs_gap}: ${tolerance}`);
        console.log("----------------------------------");

        if(gap < 0 && abs_gap > tolerance) {
            min  = curr;
            curr = (min + max) / 2;
        }
        else if(gap > 0 && abs_gap > tolerance) {
            max = curr;
            curr = (min + max) / 2;
        }
        else {
           text_font = ctx.font;
           break;
        }

    }

}

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
    set_main_canvas(canvas);
    set_canvas_fill("white");
    set_canvas_line_width(STROKE_SIZE);

    //
    // Configure the values
    date = new Date();
    hours   = date.getHours  ();
    minutes = date.getMinutes();
    seconds = date.getSeconds();

    total_time = hours   * SECONDS_IN_HOUR
               + minutes * SECONDS_IN_MINUTE
               + seconds;
    prev_date = Date.now();

    recalculate_sizes();

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

        const curr_date = Date.now();
        total_time += (curr_date - prev_date) / 1000;
        prev_date = curr_date;

        seconds = (total_time % SECONDS_IN_MINUTE);
        minutes = (total_time % SECONDS_IN_HOUR  ) / SECONDS_IN_MINUTE;
        hours   = (total_time % SECONDS_IN_DAY   ) / SECONDS_IN_HOUR;
        if(hours > 13) {
            hours -= 12;
        }

        //
        // Arcs.
        Draw_Arc(seconds, 60, base_radius - 40, "#FF0000", "#FF000020");
        Draw_Arc(minutes, 60, base_radius - 20, "#00FF00", "#00FF0020");
        Draw_Arc(hours,   12, base_radius - 00, "#0000FF", "#0000FF20");

        //
        // Timer.
        var str = "";
        {
            let h = to_int(hours  );
            let m = to_int(minutes);
            let s = to_int(seconds);

            str +=         ((h < 10) ? "0" + h : h);
            str += " : " + ((m < 10) ? "0" + m : m);
            str += " : " + ((s < 10) ? "0" + s : s);
        }

        const ctx = get_main_canvas_context();

        ctx.font      = text_font;
        ctx.fillStyle = text_color;
        ctx.fillText(str, -text_size.width * 0.5, text_size.width * 0.05);
    end_draw();
}
