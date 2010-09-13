# Form Engine Performance

                             Chrome           Firefox          IE8
    
    elementInitialization         7                82          219
    markupGeneration             14                53          109
    markupInsertion             250               964          172  // innerHTML
    controlInitialization        92               346         3047  // jQuery
    bindData                     43              2805          922  // jQuery
