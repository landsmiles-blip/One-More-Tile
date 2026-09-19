    const LEVELS = [
      {
        "id": 1,
        "name": "The Open Arena",
        "w": 4,
        "h": 3,
        "budget": 0,
        "par": 11,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 1
        },
        "checkpoints": [],
        "grid": [
          [
            2,
            2,
            2,
            2
          ],
          [
            4,
            2,
            2,
            2
          ],
          [
            2,
            2,
            2,
            2
          ]
        ]
      },
      {
        "id": 2,
        "name": "The Central Pillar",
        "w": 4,
        "h": 4,
        "budget": 0,
        "par": 14,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 2
        },
        "checkpoints": [],
        "grid": [
          [
            2,
            2,
            2,
            2
          ],
          [
            2,
            2,
            1,
            2
          ],
          [
            4,
            2,
            2,
            2
          ],
          [
            2,
            2,
            2,
            2
          ]
        ]
      },
      {
        "id": 3,
        "name": "The Dual Pillars",
        "w": 5,
        "h": 4,
        "budget": 0,
        "par": 17,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 3
        },
        "checkpoints": [],
        "grid": [
          [
            2,
            2,
            2,
            2,
            2
          ],
          [
            2,
            2,
            1,
            2,
            2
          ],
          [
            2,
            2,
            1,
            2,
            2
          ],
          [
            4,
            2,
            2,
            2,
            2
          ]
        ]
      },
      {
        "id": 4,
        "name": "The Parity Split",
        "w": 5,
        "h": 5,
        "budget": 0,
        "par": 23,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 1,
          "y": 4
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 4,
            "y": 0,
            "cellType": 5
          }
        ],
        "grid": [
          [
            2,
            2,
            2,
            2,
            5
          ],
          [
            2,
            2,
            2,
            2,
            2
          ],
          [
            2,
            2,
            1,
            2,
            2
          ],
          [
            2,
            2,
            2,
            2,
            2
          ],
          [
            2,
            4,
            2,
            2,
            2
          ]
        ]
      },
      {
        "id": 5,
        "name": "The Hamiltonian Crucible",
        "w": 5,
        "h": 4,
        "budget": 0,
        "par": 19,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 4,
          "y": 3
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 4,
            "y": 0,
            "cellType": 5
          },
          {
            "id": 2,
            "x": 0,
            "y": 3,
            "cellType": 6
          }
        ],
        "grid": [
          [
            2,
            2,
            2,
            2,
            5
          ],
          [
            2,
            2,
            2,
            2,
            2
          ],
          [
            2,
            2,
            2,
            2,
            2
          ],
          [
            6,
            2,
            2,
            2,
            4
          ]
        ]
      },
      {
        "id": 6,
        "name": "The Figure Eight",
        "w": 5,
        "h": 3,
        "budget": 0,
        "par": 15,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 3,
          "y": 2
        },
        "checkpoints": [],
        "grid": [
          [
            2,
            2,
            2,
            2,
            2
          ],
          [
            2,
            2,
            11,
            2,
            2
          ],
          [
            2,
            2,
            2,
            4,
            2
          ]
        ]
      },
      {
        "id": 7,
        "name": "The Twin Hubs",
        "w": 5,
        "h": 5,
        "budget": 0,
        "par": 24,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 4,
          "y": 4
        },
        "checkpoints": [],
        "grid": [
          [
            2,
            2,
            2,
            2,
            2
          ],
          [
            2,
            2,
            1,
            2,
            2
          ],
          [
            2,
            11,
            2,
            11,
            2
          ],
          [
            2,
            2,
            1,
            2,
            2
          ],
          [
            2,
            2,
            2,
            2,
            4
          ]
        ]
      },
      {
        "id": 8,
        "name": "The Trefoil Knot",
        "w": 6,
        "h": 4,
        "budget": 0,
        "par": 25,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 3
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 5,
            "y": 0,
            "cellType": 5
          }
        ],
        "grid": [
          [
            2,
            2,
            2,
            2,
            2,
            5
          ],
          [
            2,
            11,
            2,
            2,
            2,
            2
          ],
          [
            2,
            2,
            2,
            11,
            2,
            2
          ],
          [
            4,
            2,
            2,
            2,
            2,
            2
          ]
        ]
      },
      {
        "id": 9,
        "name": "The Celtic Cross",
        "w": 6,
        "h": 5,
        "budget": 0,
        "par": 31,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 5,
          "y": 4
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 5,
            "y": 0,
            "cellType": 5
          },
          {
            "id": 2,
            "x": 0,
            "y": 4,
            "cellType": 6
          }
        ],
        "grid": [
          [
            2,
            2,
            2,
            2,
            2,
            5
          ],
          [
            2,
            2,
            2,
            2,
            2,
            2
          ],
          [
            2,
            2,
            11,
            11,
            2,
            2
          ],
          [
            2,
            2,
            2,
            2,
            2,
            2
          ],
          [
            6,
            2,
            2,
            2,
            2,
            4
          ]
        ]
      },
      {
        "id": 10,
        "name": "The Gordian Web",
        "w": 6,
        "h": 5,
        "budget": 0,
        "par": 30,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 4
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 5,
            "y": 0,
            "cellType": 5
          },
          {
            "id": 2,
            "x": 5,
            "y": 4,
            "cellType": 6
          }
        ],
        "grid": [
          [
            2,
            2,
            2,
            2,
            2,
            5
          ],
          [
            2,
            2,
            2,
            2,
            2,
            2
          ],
          [
            2,
            2,
            11,
            2,
            2,
            2
          ],
          [
            2,
            2,
            2,
            2,
            2,
            2
          ],
          [
            4,
            2,
            2,
            2,
            2,
            6
          ]
        ]
      },
      {
        "id": 11,
        "name": "Frictionless Vector",
        "w": 5,
        "h": 4,
        "budget": 7,
        "par": 7,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 3
        },
        "checkpoints": [],
        "grid": [
          [
            2,
            12,
            12,
            12,
            1
          ],
          [
            2,
            1,
            1,
            2,
            2
          ],
          [
            2,
            1,
            1,
            2,
            2
          ],
          [
            4,
            2,
            2,
            2,
            2
          ]
        ]
      },
      {
        "id": 12,
        "name": "The Trail Bumper",
        "w": 5,
        "h": 5,
        "budget": 8,
        "par": 8,
        "spawn": {
          "x": 0,
          "y": 2
        },
        "goal": {
          "x": 0,
          "y": 1
        },
        "checkpoints": [],
        "grid": [
          [
            1,
            1,
            2,
            2,
            2
          ],
          [
            4,
            2,
            12,
            1,
            2
          ],
          [
            2,
            12,
            12,
            12,
            2
          ],
          [
            1,
            1,
            12,
            1,
            1
          ],
          [
            1,
            1,
            1,
            1,
            1
          ]
        ]
      },
      {
        "id": 13,
        "name": "Permafrost Chutes",
        "w": 6,
        "h": 5,
        "budget": 7,
        "par": 7,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 4
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 5,
            "y": 0,
            "cellType": 5
          }
        ],
        "grid": [
          [
            2,
            12,
            12,
            12,
            2,
            5
          ],
          [
            1,
            1,
            1,
            1,
            1,
            2
          ],
          [
            2,
            12,
            12,
            12,
            12,
            2
          ],
          [
            2,
            1,
            1,
            1,
            1,
            1
          ],
          [
            4,
            1,
            1,
            1,
            1,
            1
          ]
        ]
      },
      {
        "id": 14,
        "name": "The Glacial Loom",
        "w": 6,
        "h": 5,
        "budget": 7,
        "par": 7,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 4
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 5,
            "y": 0,
            "cellType": 5
          },
          {
            "id": 2,
            "x": 5,
            "y": 4,
            "cellType": 6
          }
        ],
        "grid": [
          [
            2,
            12,
            12,
            12,
            2,
            5
          ],
          [
            1,
            1,
            1,
            1,
            1,
            2
          ],
          [
            1,
            1,
            1,
            1,
            1,
            2
          ],
          [
            1,
            1,
            1,
            1,
            1,
            2
          ],
          [
            4,
            12,
            12,
            12,
            12,
            6
          ]
        ]
      },
      {
        "id": 15,
        "name": "The Absolute Zero",
        "w": 6,
        "h": 5,
        "budget": 7,
        "par": 7,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 4
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 5,
            "y": 0,
            "cellType": 5
          },
          {
            "id": 2,
            "x": 0,
            "y": 2,
            "cellType": 6
          }
        ],
        "grid": [
          [
            2,
            12,
            12,
            12,
            2,
            5
          ],
          [
            1,
            1,
            1,
            1,
            1,
            2
          ],
          [
            6,
            12,
            12,
            12,
            12,
            2
          ],
          [
            2,
            1,
            1,
            1,
            1,
            1
          ],
          [
            4,
            2,
            2,
            2,
            2,
            2
          ]
        ]
      },
      {
        "id": 16,
        "name": "The Polarity Slipstream",
        "w": 6,
        "h": 5,
        "budget": 6,
        "par": 6,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 4
        },
        "checkpoints": [],
        "grid": [
          [
            2,
            12,
            12,
            12,
            8,
            1
          ],
          [
            1,
            1,
            1,
            1,
            2,
            1
          ],
          [
            1,
            1,
            1,
            1,
            10,
            1
          ],
          [
            1,
            1,
            1,
            1,
            2,
            1
          ],
          [
            4,
            12,
            12,
            12,
            2,
            1
          ]
        ],
        "initialPhase": "RED"
      },
      {
        "id": 17,
        "name": "Crossroads on Ice",
        "w": 6,
        "h": 5,
        "budget": 9,
        "par": 9,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 4
        },
        "checkpoints": [],
        "grid": [
          [
            2,
            12,
            12,
            2,
            2,
            1
          ],
          [
            1,
            1,
            1,
            2,
            1,
            1
          ],
          [
            1,
            1,
            1,
            11,
            2,
            2
          ],
          [
            1,
            1,
            1,
            2,
            1,
            2
          ],
          [
            4,
            12,
            12,
            2,
            1,
            1
          ]
        ]
      },
      {
        "id": 18,
        "name": "The Entangled Circuit",
        "w": 6,
        "h": 6,
        "budget": 13,
        "par": 13,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 5
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 5,
            "y": 0,
            "cellType": 5
          }
        ],
        "grid": [
          [
            2,
            2,
            2,
            9,
            2,
            5
          ],
          [
            1,
            1,
            1,
            1,
            1,
            8
          ],
          [
            1,
            1,
            1,
            1,
            1,
            2
          ],
          [
            1,
            1,
            1,
            10,
            11,
            2
          ],
          [
            1,
            1,
            1,
            2,
            1,
            1
          ],
          [
            4,
            12,
            12,
            2,
            1,
            1
          ]
        ],
        "initialPhase": "RED"
      },
      {
        "id": 19,
        "name": "The Cryogenic Nexus",
        "w": 6,
        "h": 6,
        "budget": 10,
        "par": 10,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 5
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 5,
            "y": 0,
            "cellType": 5
          },
          {
            "id": 2,
            "x": 3,
            "y": 5,
            "cellType": 6
          }
        ],
        "grid": [
          [
            2,
            12,
            12,
            12,
            2,
            5
          ],
          [
            1,
            1,
            1,
            1,
            1,
            8
          ],
          [
            1,
            1,
            1,
            1,
            1,
            2
          ],
          [
            1,
            1,
            1,
            10,
            11,
            2
          ],
          [
            1,
            1,
            1,
            2,
            1,
            1
          ],
          [
            4,
            12,
            12,
            6,
            1,
            1
          ]
        ],
        "initialPhase": "RED"
      },
      {
        "id": 20,
        "name": "The Grandmaster Labyrinth",
        "w": 7,
        "h": 7,
        "budget": 14,
        "par": 14,
        "spawn": {
          "x": 0,
          "y": 0
        },
        "goal": {
          "x": 0,
          "y": 6
        },
        "checkpoints": [
          {
            "id": 1,
            "x": 6,
            "y": 0,
            "cellType": 5
          },
          {
            "id": 2,
            "x": 2,
            "y": 5,
            "cellType": 6
          }
        ],
        "grid": [
          [
            2,
            2,
            7,
            2,
            9,
            2,
            5
          ],
          [
            1,
            1,
            1,
            1,
            1,
            1,
            8
          ],
          [
            1,
            1,
            1,
            1,
            1,
            1,
            2
          ],
          [
            1,
            1,
            11,
            12,
            12,
            12,
            2
          ],
          [
            1,
            1,
            2,
            1,
            1,
            1,
            1
          ],
          [
            1,
            1,
            6,
            1,
            1,
            1,
            1
          ],
          [
            4,
            12,
            10,
            1,
            1,
            1,
            1
          ]
        ],
        "initialPhase": "RED"
      }
    ];