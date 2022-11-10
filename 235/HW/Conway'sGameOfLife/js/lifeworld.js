const lifeworld = {

    init(numCols, numRows) {
        this.numCols = numCols;
        this.numRows = numRows;
        this.world = this.buildArray();
        this.worldBuffer = this.buildArray();
        this.randomSetup();
    },

    buildArray() {
        let outerArray = [];
        for (let row = 0; row < this.numRows; row++) {
            let innerArray = [];
            for (let col = 0; col < this.numCols; col++) {
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        return outerArray;
    },

    randomSetup() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                this.world[row][col] = 0;
                if (Math.random() < .1) {
                    this.world[row][col] = 1;
                }
            }
        }
    },

    getLivingNeighbors(row, col) {
        // TODO:
        // row and col should > than 0, if not return 0
        // row and col should be < the length of the applicable array, minus 1. If not return 0
        if (row >= 0 && col >= 0 && row < numRows && col < numCols) {
            // count up how many neighbors are alive at N,NE,E,SE,S,SW,W,SE - use this.world[row][col-1] etc
            let livingNeighbors = 0;

            // Check the top row 
            if (row != 0) {
                if (col != 0) {
                    // NW
                    if (this.world[row - 1][col - 1])
                        livingNeighbors++;
                }

                // N
                if (this.world[row - 1][col])
                    livingNeighbors++;

                if (col != numCols - 1) {
                    // NE
                    if (this.world[row - 1][col + 1])
                        livingNeighbors++;
                }

            }

            if (col != 0) {
                // W
                if (this.world[row][col - 1])
                    livingNeighbors++;
            }

            if (col != numCols - 1) {
                // E
                if (this.world[row][col + 1])
                    livingNeighbors++;
            }

            if (row != numRows - 1) {
                if (col != 0) {
                    // SW
                    if (this.world[row + 1][col - 1])
                        livingNeighbors++;
                }

                // S
                if (this.world[row + 1][col])
                    livingNeighbors++;

                if (col != numCols - 1) {
                    // SE
                    if (this.world[row + 1][col + 1])
                        livingNeighbors++;
                }

            }

            // return that sum
            return livingNeighbors;
        }
        else
            return 0;
    },

    step() {
        // TODO:



        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                // nested for loop will call getLivingNeighbors() on each cell in this.world
                let livingNeighbors = this.getLivingNeighbors(row, col);
                let state;

                // Determine if that cell in the next generation should be alive (see wikipedia life page linked at top)
                if (this.world[row][col] == 1) {
                    if (livingNeighbors < 2) {
                        state = 0;
                    }
                    else if (livingNeighbors == 2 || livingNeighbors == 3) {
                        state = 1;
                    }
                    else {
                        state = 0;
                    }
                }
                else {
                    if (livingNeighbors == 3) {
                        state = 1;
                    }
                }

                // Put a 1 or zero into the right location in this.worldBuffer
                lifeworld.worldBuffer[row][col] = state;
            }
        }

        // when the looping is done, swap .world and .worldBuffer (use a temp variable to do so)
        let temp = this.world;
        this.world = this.worldBuffer;
        this.worldBuffer = temp;

    }
} // end lifeworld literal 