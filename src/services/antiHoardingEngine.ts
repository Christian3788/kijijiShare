import { User } from '../types';

export interface EligibilityResult {
  allowed: boolean;
  reason?: string;
  activeClaimsCount: number;
  maxActiveClaims: number;
  rolling7DayClaimsCount: number;
  rolling7DayLimit: number;
  giveToReceiveRatio: number;
  inCooldown: boolean;
  cooldownHoursRemaining?: number;
}

/**
 * Anti-Hoarding & Fair Distribution Engine
 * Enforces mathematically bounded access to prevent hoarders & resellers
 * while protecting neighbors in genuine need.
 */
export function checkClaimEligibility(user: User): EligibilityResult {
  // 1. Determine active claim cap based on trust tier
  let maxActive = 2; // Default for NEWCOMER
  if (user.trustTier === 'TRUSTED_NEIGHBOR') maxActive = 4;
  if (user.trustTier === 'PILLAR_OF_COMMUNITY') maxActive = 6;
  if (user.trustTier === 'PROBATION') maxActive = 1;

  // 2. Compute dynamic rolling 7-day window limit
  // Formula: R_7 = min(8, floor(0.5 * giftsGiven + 4))
  // Generous base of 4 items/week for those with zero surplus to give
  const rollingLimit = Math.min(8, Math.floor(0.5 * user.giftsGivenCount + 4));

  // 3. Compute Give-to-Receive Ratio
  const totalInteractions = user.giftsGivenCount + user.giftsReceivedCount;
  const ratio = totalInteractions === 0 
    ? 1.0 
    : Number((user.giftsGivenCount / Math.max(1, user.giftsReceivedCount)).toFixed(2));

  // 4. Check Cooldown timer
  let inCooldown = false;
  let cooldownHoursRemaining = 0;
  if (user.cooldownUntil) {
    const cooldownTime = new Date(user.cooldownUntil).getTime();
    const now = Date.now();
    if (cooldownTime > now) {
      inCooldown = true;
      cooldownHoursRemaining = Math.ceil((cooldownTime - now) / (1000 * 60 * 60));
    }
  }

  // Evaluate Constraints
  if (inCooldown) {
    return {
      allowed: false,
      reason: `Fair-share pause active. To prevent claiming sprints, you may request another item in ${cooldownHoursRemaining} hour(s).`,
      activeClaimsCount: user.activeClaimsCount,
      maxActiveClaims: maxActive,
      rolling7DayClaimsCount: user.rolling7DayClaimsCount,
      rolling7DayLimit: rollingLimit,
      giveToReceiveRatio: ratio,
      inCooldown: true,
      cooldownHoursRemaining,
    };
  }

  if (user.activeClaimsCount >= maxActive) {
    return {
      allowed: false,
      reason: `Active claim limit reached (${user.activeClaimsCount}/${maxActive}). Complete or withdraw a pending pickup before expressing interest in new items.`,
      activeClaimsCount: user.activeClaimsCount,
      maxActiveClaims: maxActive,
      rolling7DayClaimsCount: user.rolling7DayClaimsCount,
      rolling7DayLimit: rollingLimit,
      giveToReceiveRatio: ratio,
      inCooldown: false,
    };
  }

  if (user.rolling7DayClaimsCount >= rollingLimit) {
    return {
      allowed: false,
      reason: `Weekly community distribution cap reached (${user.rolling7DayClaimsCount}/${rollingLimit} in 7 days). This gives other neighbors a turn to receive.`,
      activeClaimsCount: user.activeClaimsCount,
      maxActiveClaims: maxActive,
      rolling7DayClaimsCount: user.rolling7DayClaimsCount,
      rolling7DayLimit: rollingLimit,
      giveToReceiveRatio: ratio,
      inCooldown: false,
    };
  }

  return {
    allowed: true,
    activeClaimsCount: user.activeClaimsCount,
    maxActiveClaims: maxActive,
    rolling7DayClaimsCount: user.rolling7DayClaimsCount,
    rolling7DayLimit: rollingLimit,
    giveToReceiveRatio: ratio,
    inCooldown: false,
  };
}

/**
 * Calculates updated karma score
 * K = clamp(0, 100, 50 + 5*vouches + 3*giftsGiven + 1*giftsReceived - 25*noShows)
 */
export function calculateKarma(
  vouchCount: number,
  giftsGiven: number,
  giftsReceived: number,
  noShows: number
): number {
  const raw = 50 + (vouchCount * 5) + (giftsGiven * 3) + (giftsReceived * 1) - (noShows * 25);
  return Math.max(0, Math.min(100, raw));
}
