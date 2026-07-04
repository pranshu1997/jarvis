function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function hapticLight() {
  vibrate(8);
}

export function hapticSuccess() {
  vibrate([10, 30, 10]);
}

export function hapticCombo() {
  vibrate([5, 20, 5, 20, 15]);
}

export function hapticRankUp() {
  vibrate([20, 40, 20, 40, 60]);
}

export function hapticDungeonHit() {
  vibrate([30, 10, 50]);
}

export function hapticPerfectDay() {
  vibrate([15, 25, 15, 25, 15, 40]);
}

export function hapticShopPurchase() {
  vibrate([8, 16, 24]);
}

export function hapticError() {
  vibrate([50, 20, 50, 20, 50]);
}

export function hapticStreak() {
  vibrate([10, 15, 10, 15, 20, 30]);
}

export function hapticCategoryComplete() {
  vibrate([10, 20, 10, 20, 30, 10, 50]);
}

export function hapticLevelUp() {
  vibrate([15, 30, 15, 30, 15, 60, 100]);
}

export function hapticQuestComplete() {
  vibrate([20, 30, 20, 30, 60]);
}

export function hapticSwipe() {
  vibrate(6);
}

export function hapticUndo() {
  vibrate([20, 10, 20]);
}
