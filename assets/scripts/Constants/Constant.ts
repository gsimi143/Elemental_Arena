export const PLAYER_TYPE = {
  PLAYER: "Player",
  ENEMY: "Enemy",
};

/**
 * Special Ability: 
 * "Shield" – Increases defence for 1 turn, reducing incoming damage by 50%.
 * "Heal" – Heals himself by 30 HP.
 * "Burst" – Deals damage to all enemies within his movement range.
 */
export enum SPECIAL_ABILITY_TYPE {
  BURST = "Burst",
  HEAL = "Heal",
  SHIELD = "Shield",
}

/**
 * Element Type modifies damage:
  - Fire > Earth: Fire deals +50% damage to Earth.
  - Earth > Water: Earth deals +50% damage to Water.
  - Water > Fire: Water deals +50% damage to Fire.
 */
export enum ELEMENT_TYPE {
  FIRE = "Fire",
  EARTH = "Earth",
  WATER = "Water",
}

export enum CHARACTER_ANIMATION_NAME {
  IDLE = "IdleAnimation",
  DEAD = "DeadAnimation",
  RUN = "RunAnimation",
  SHOOT = "ShootAnimation",
}

export const MAX_PLAYERS_DATA = 1;

export const CUSTOM_EVENT = {
  LOADING_DONE: "LoadingDone",
};

export enum SOUNDS_NAME {
  BACKGROUND_MUSIC = "BackgroundMusic",
  ATTACK = "Attack",
  DEAD = "Dead",
  SHIELD = "Shield",
  HEAL = "Heal",
  GAME_END = "GameEnd",
}

export enum ASSET_CACHE_MODE {
  /** 一Secondary (immediately destroy nodes, prefabricated body resources are released immediately） */
  Once = 1,
  /** Normal (destroy the node immediately, but cache prefabricated resources） */
  Normal,
  /** Frequent (only close the node, and cache prefabricated body resources) */
  Frequent,
}
