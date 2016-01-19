#ifndef WOT_STRUCT_H

#define WOT_STRUCT_H

namespace libwot {

    using namespace std;

    const bool DISPLAY_DURATIONS = false;

    struct Node {

        int32_t nbLinks;
        int32_t *links;
    };

    struct WebOfTrust {

        int32_t nbMembers;
        Node *nodes;
    };

}
#endif
