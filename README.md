# Elemental Arena

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Dependencies](#dependencies)
4. [Gameplay](#gameplay)
   - [Controls](#controls)
   - [Objectives](#objectives)
   - [Links](#links)
5. [Game Mechanics Overview](#game-mechanics-overview)
5. [AI System](#ai-system)
6. [Coding Practices](#coding-practices)
7. [Credits](#credits)



## Introduction

Welcome to **Elemental Arena**! This game offers an engaging tactical experience where you control characters on a grid-based battlefield, using elemental powers and strategic combat to defeat your opponents. Each player takes turns to move, attack, or use special abilities, while managing their resources and positioning to outsmart the AI.

## Installation

### Prerequisites

- Cocos Creator 3.8.5 (or higher).
- A text editor like Visual Studio Code (VS Code) for editing scripts.

### Steps

1. **Clone the Repository:**
    https://github.com/yourusername/turn-based-strategy-game.git

2. **Open the Project in Cocos Creator:**
   - Launch **Cocos Creator** and open the project by selecting the `assets` folder from the cloned repository.

3. **Run the Game:**
   - Click the **"Play"** button in Cocos Creator to start the game.


## Dependencies

This game relies on **Cocos Creator** as the main game engine. You will need Cocos Creator version **v3.8.5** (or higher) to run this project correctly.

## Gameplay

### Links

**Game** [[Elemental Arena](https://elemental-arena-by-simranjeet-kaur.netlify.app/)]


### Controls

- **Mouse/Touch**:
  - Click on highlighted to move a character to an adjacent tile.
  - Click on attack button to attack the enemies within range.
  - Use the special ability button to activate a character's special power.


### Objectives

- Defeat the AI by reducing its characters’ health to zero.
- Utilize strategic movements and special abilities to exploit elemental weaknesses.


## Game Mechanics Overview

### **Grid System**
- The battlefield is represented by a 6x6 grid.
- The player and AI characters move and attack within this grid.

### **Turn-Based Combat**
- The game alternates turns between the player and the AI.
- On each turn, a character can:
  - **Move** – Move up to their movement range.
  - **Attack** – Attack an adjacent enemy.
  - **Use Special Ability** – Use a unique ability if it is off cooldown.

### **Elemental System**
- Characters have elemental types: **Fire**, **Water**, and **Earth**.
- Elemental interactions affect damage:
  - **Fire > Earth**: Fire deals more damage to Earth.
  - **Earth > Water**: Earth deals more damage to Water.
  - **Water > Fire**: Water deals more damage to Fire.

### **Special Abilities**
Each character has a unique special ability:
- **Burst**: Deals damage to all enemies in a in given range of area.
- **Heal**: Heals himself.
- **Shield**: Provides a defense boost for 2 turns.


## AI System

The AI in this game uses basic decision-making logic to determine its actions. The AI evaluates its health, the presence of enemies, and whether its special ability is available. The AI uses a simple decision-making process based on the following rules:
1. **Health Threshold**: If the AI's health is low, it may attempt to heal itself.
2. **Attack Priority**: The AI will prioritize attacking when there are opponents within range.
3. **Movement**: The AI will move randomly if no immediate threats or actions are present.


## Coding Practices

### Scene: Gameplay

The **Gameplay** scene is responsible for:
- Loading game resources.
- After the loading showing playground and enable user to play the game


### Game Flow

- **Turn Management**: Alternates turns between the player and AI, allowing for actions like movement, attack, and special abilities.
- **Grid Management**: Uses a grid system to manage character placement and movement.
- **Elemental System**: Implements a rock-paper-scissors-style system for elemental strengths and weaknesses.


### Multi-Resolution Support

- Uses `ScreenAdapter.ts` to handle various screen resolutions.
- Automatically adjusts UI elements to maintain consistency across devices.


### AI Decision-Making

- The AI's decisions are based on health, available actions (attack, special abilities), and proximity to the player.


## Credits

List the team members and their roles:

- **Initial Game Idea:** Infinity Games (Provided the core concept and idea for the game.)
- **Game Designer:** Simranjeet Kaur (Responsible for the complete game design, mechanics, and gameplay features.)
- **Lead Developer:** Simranjeet Kaur (Handled the coding, implementation of gameplay features, and technical development.)
- **Artists:** Random Search from Google.com
- **Sound Designer:** [Pixbay.com](https://pixabay.com/sound-effects)

