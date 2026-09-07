
/*
  CHeWs content adapter.
  Prototype mode reads local JSON so GitHub Pages requires no backend.
  Future admin mode can replace getJson() with Firestore calls while keeping
  the same data contracts used by the public pages.
*/
window.CHEWS_CONTENT = {
  mode: 'json',
  root() { return document.body.dataset.root || '.'; },
  async getJson(path) {
    const response = await fetch(`${this.root()}/${path}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.json();
  },
  site() { return this.getJson('data/site.json'); },
  classes() { return this.getJson('data/classes.json'); },
  team() { return this.getJson('data/team.json'); },
  gallery() { return this.getJson('data/gallery.json'); },
  events() { return this.getJson('data/events.json'); }
};
