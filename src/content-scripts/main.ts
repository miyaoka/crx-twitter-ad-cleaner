// timeline
const timelineSelector = 'div[style^="transform"]';
// 'Who to follow', 'Topics to follow', 'Promoted Tweet', 'More Replies'
const headingSelector = 'h2[role="heading"]';
// promotion
const promotionSelector =
  "div[data-testid=placementTracking] > :not(div[data-testid=videoPlayer])";
// Show more, More Topics
const moreSelector = ':scope > div > a[href^="/i/"]';

const timelinePageRegExp = new RegExp("^/(home|search)");
const statusPageRegExp = new RegExp("^/[^/]+/status/");
const profilePageSelector = '[data-testid="UserName"]';

// const testidMAp = $$("[data-testid]").map((el) => el.getAttribute("data-testid")).reduce((acc, cur) => ({ ...acc, [cur]: (acc[cur] || 0) + 1 }), {});

const needClean = () => {
  const { pathname } = location;
  // home, search
  if (timelinePageRegExp.test(pathname)) {
    return true;
  }
  // status (without photo)
  if (statusPageRegExp.test(pathname)) {
    const [, , , , action] = pathname.split("/");

    return action !== "photo";
  }
  // profile
  if (document.querySelector(profilePageSelector)) {
    return true;
  }
  return false;
};

const removeChildren = (line: Element) => {
  Array.from(line.children).forEach((el) => el.remove());
};

const cleanUp = () => {
  if (!needClean()) {
    return;
  }

  let topicStack: Element[] = [];
  const revercedTimeline = Array.from(
    document.querySelectorAll<HTMLElement>(timelineSelector)
  ).reverse();

  revercedTimeline.forEach((line) => {
    // topic footer
    if (line.querySelector(moreSelector)) {
      console.log("add stack: topic footer");
      topicStack.push(line);
      return;
    }

    const heading = line.querySelector(headingSelector);
    const promotion = line.querySelector(promotionSelector);

    // promotion
    if (promotion) {
      console.log("remove: promotion");
      promotion.parentElement?.remove();
      heading?.remove();
      const children = Array.from(line.children) as HTMLElement[];
      children.forEach((el) => {
        el.style.display = "none";
      });
      return;
    }

    if (heading) {
      const len = topicStack.length;
      // remove topic stack and heading
      if (len > 0) {
        console.log(`remove stack (${len}): ${heading.textContent}`);
        topicStack.forEach((l) => {
          removeChildren(l);
        });
        topicStack = [];
        removeChildren(line);
      }
      return;
    }

    // in topic
    if (topicStack.length > 0) {
      console.log("add stack: topic body");
      topicStack.push(line);
      return;
    }
  });
};

new PerformanceObserver(() => {
  cleanUp();
}).observe({
  type: "longtask",
  buffered: true,
});

document.addEventListener("scroll", () => {
  cleanUp();
});
