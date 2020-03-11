
//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
const SIMPLE_TREE_VERSION_MAJOR = 1;
const SIMPLE_TREE_VERSION_MINOR = 0;
const SIMPLE_TREE_VERSION_BABY  = 0;

//----------------------------------------------------------------------------//
// Public Functions                                                           //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function GetVersion()
{
    return String_Cat(
        SIMPLE_TREE_VERSION_MAJOR, ".",
        SIMPLE_TREE_VERSION_MINOR, ".",
        SIMPLE_TREE_VERSION_BABY
    );
}
