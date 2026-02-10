const React = require('react');

module.exports = function ReactMarkdownMock({ children, components }) {
  const content = components && typeof components.p === 'function'
    ? components.p({ children })
    : children;

  return React.createElement('div', { className: 'markdown' }, content);
};
