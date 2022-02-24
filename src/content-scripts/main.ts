// timeline
const timelineSelector = 'div[style^="transform"]';
// 'Who to follow', 'Topics to follow', 'Promoted Tweet'
// not 'More Replies'
const headingSelector = ':scope > div > h2[role="heading"]';
// promotion
const promotionSelector = "div[data-testid=placementTracking]";
// Show more, More Topics
const moreSelector = 'a[href^="/i/"]';

const timelinePageRegExp = new RegExp("^/(home|search)");
const statusPageRegExp = new RegExp("^/[^/]+/status/");
const profileBannerSelector =
  'img[src^="https://pbs.twimg.com/profile_banners/"]';

const needClean = () => {
  const { pathname } = location;
  // home, search
  if (timelinePageRegExp.test(pathname)) return true;
  // replay
  if (statusPageRegExp.test(pathname)) return true;
  // profile
  if (document.querySelector(profileBannerSelector)) return true;
  return false;
};

const removeChildren = (line: Element) => {
  Array.from(line.children).forEach((el) => el.remove());
};

const removePromotion = (line: Element) => {
  console.log("remove: promotion");
  removeChildren(line);
};
const clean = () => {
  if (!needClean()) {
    return;
  }

  let inTopicSection = false;

  document.querySelectorAll(timelineSelector).forEach((line) => {
    const heading = line.querySelector(headingSelector);
    const promotion = line.querySelector(promotionSelector);

    if (heading) {
      // title with promotion
      if (promotion) {
        removePromotion(line);
        return;
      }
      // title only (topic start)
      inTopicSection = true;
      console.log("remove: topic title -> " + heading.textContent);
      removeChildren(line);
      return;
    }

    // promotion only
    if (promotion) {
      removePromotion(line);
      return;
    }

    // topic end
    if (line.querySelector(moreSelector)) {
      console.log("remove: topic footer");
      removeChildren(line);
      inTopicSection = false;
      return;
    }

    // in topic
    if (inTopicSection) {
      console.log("remove: topic body");
      removeChildren(line);
      return;
    }
  });
};

new PerformanceObserver(() => {
  console.log("LCP");
  clean();
}).observe({
  type: "largest-contentful-paint",
  buffered: true,
});

document.addEventListener("scroll", () => {
  clean();
});
