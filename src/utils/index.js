import config from '../config';

/**
 * 设置网站标题
 * @param {*} title 标题
 * @returns 
 */
const SetPageTitle = (title) => {
  if (title) {
    return `${title} | ${config.TITLE}`;
  }
  return config.TITLE;
}

export default {
  SetPageTitle
}
