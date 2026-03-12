import { getStripe } from "./client";

export async function createConnectAccount(email: string) {
  const account = await getStripe().accounts.create({
    type: "express",
    country: "US",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    business_profile: {
      mcc: "5812",
      product_description: "Home-cooked meals via MEHKO permit",
    },
  });
  return account;
}

export async function createOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  const accountLink = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  return accountLink;
}

export async function getAccountStatus(accountId: string) {
  const account = await getStripe().accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: account.requirements,
  };
}
