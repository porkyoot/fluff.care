/**
 * Cloudflare Worker: dc.fluff.care -> https://discord.gg/dSWArwRJBt
 */
export default {
  async fetch(request, env) {
    const target = env.DISCORD_INVITE_URL || 'https://discord.gg/dSWArwRJBt';
    return Response.redirect(target, 302);
  },
};
