// GDS GOV.UK Components Extension for markdown-it
'use strict';

function gdsComponents(md) {
  // Container components (warning, inset, details, etc.)
  const containerComponents = {
    warning: {
      class: 'govuk-warning-text',
      icon: '<span class="govuk-warning-text__icon" aria-hidden="true">!</span>',
      wrapper: 'strong',
      prefix: 'Warning'
    },
    inset: {
      class: 'govuk-inset-text'
    },
    details: {
      class: 'govuk-details',
      summary: true
    },
    notification: {
      class: 'govuk-notification-banner',
      role: 'region',
      variants: ['success']
    },
    error: {
      class: 'govuk-error-summary',
      role: 'alert'
    }
  };

  // Add container rule
  md.renderer.rules.container_gds_open = function(tokens, idx) {
    const token = tokens[idx];
    const type = token.info.trim().split(' ')[0];
    const variant = token.info.trim().split(' ')[1];
    const component = containerComponents[type];
    
    if (!component) return '';
    
    let html = '';
    let classes = component.class;
    
    if (variant && component.variants && component.variants.includes(variant)) {
      classes += ' ' + component.class + '--' + variant;
    }
    
    if (type === 'warning') {
      html = '<div class="' + classes + '">\n';
      html += '  ' + component.icon + '\n';
      html += '  <' + component.wrapper + ' class="govuk-warning-text__text">\n';
      if (component.prefix) {
        html += '    <span class="govuk-warning-text__assistive">' + component.prefix + '</span>\n';
      }
    } else if (type === 'details') {
      html = '<details class="' + classes + '">\n';
    } else if (type === 'notification') {
      const roleAttr = component.role ? ' role="' + component.role + '"' : '';
      const ariaLabel = variant === 'success' ? ' aria-labelledby="govuk-notification-banner-title"' : '';
      html = '<div class="' + classes + ' ' + (variant ? 'govuk-notification-banner--' + variant : '') + '"' + roleAttr + ariaLabel + ' data-module="govuk-notification-banner">\n';
      html += '<div class="govuk-notification-banner__header">\n';
      html += '<h2 class="govuk-notification-banner__title" id="govuk-notification-banner-title">\n';
      html += variant === 'success' ? 'Success' : 'Important';
      html += '\n</h2>\n</div>\n';
      html += '<div class="govuk-notification-banner__content">\n';
    } else if (type === 'error') {
      html = '<div class="' + classes + '"' + (component.role ? ' role="' + component.role + '"' : '') + ' aria-labelledby="error-summary-title" tabindex="-1">\n';
      html += '<h2 class="govuk-error-summary__title" id="error-summary-title">\n';
      html += 'There is a problem\n';
      html += '</h2>\n<div class="govuk-error-summary__body">\n';
    } else {
      html = '<div class="' + classes + '">\n';
    }
    
    return html;
  };

  md.renderer.rules.container_gds_close = function(tokens, idx) {
    const token = tokens[idx];
    const type = token.info.trim().split(' ')[0];
    const component = containerComponents[type];
    
    if (!component) return '';
    
    if (type === 'warning') {
      return '  </' + component.wrapper + '>\n</div>\n';
    } else if (type === 'details') {
      return '</details>\n';
    } else if (type === 'notification') {
      return '</div>\n</div>\n';
    } else if (type === 'error') {
      return '</div>\n</div>\n';
    } else {
      return '</div>\n';
    }
  };

  // Custom container parser
  md.block.ruler.before('fence', 'container_gds', function(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    
    if (pos + 3 > max) return false;
    
    const marker = state.src.slice(pos, pos + 3);
    if (marker !== ':::') return false;
    
    pos += 3;
    const info = state.src.slice(pos, max).trim();
    const type = info.split(' ')[0];
    
    // Handle panel separately - don't let it fall through to generic container
    if (type === 'panel') {
      if (silent) return true;
      
      const variant = info.split(' ')[1];
      
      // Find closing :::
      let nextLine = startLine;
      let autoClosed = false;
      
      while (nextLine < endLine) {
        nextLine++;
        if (nextLine >= endLine) break;
        
        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        
        if (pos < max && state.src.slice(pos, pos + 3) === ':::') {
          autoClosed = true;
          break;
        }
      }
      
      // Extract all content lines
      const lines = [];
      for (let i = startLine + 1; i < nextLine; i++) {
        const lineStart = state.bMarks[i] + state.tShift[i];
        const lineEnd = state.eMarks[i];
        const line = state.src.slice(lineStart, lineEnd).trim();
        if (line) {
          lines.push(line);
        }
      }
      
      // Build panel HTML directly
      let panelHtml = '<div class="govuk-panel';
      if (variant === 'confirmation') {
        panelHtml += ' govuk-panel--confirmation';
      }
      panelHtml += '">\n';
      
      if (lines.length > 0) {
        // First line is the title
        panelHtml += '<h1 class="govuk-panel__title">\n';
        panelHtml += state.md.renderInline(lines[0]);
        panelHtml += '\n</h1>\n';
        
        // Remaining lines are the body
        if (lines.length > 1) {
          panelHtml += '<div class="govuk-panel__body">\n';
          for (let i = 1; i < lines.length; i++) {
            // Process inline markdown (bold, links, etc) - NOT block elements
            const processedLine = state.md.renderInline(lines[i]);
            panelHtml += processedLine;
            if (i < lines.length - 1) {
              panelHtml += '<br>\n';
            }
          }
          panelHtml += '\n</div>\n';
        }
      }
      
      panelHtml += '</div>\n';
      
      // Add as HTML block
      const token = state.push('html_block', '', 0);
      token.content = panelHtml;
      
      state.line = nextLine + (autoClosed ? 1 : 0);
      return true;
    }
    
    if (!containerComponents[type]) return false;
    
    if (silent) return true;
    
    // Find closing :::
    let nextLine = startLine;
    let autoClosed = false;
    
    while (nextLine < endLine) {
      nextLine++;
      if (nextLine >= endLine) break;
      
      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      
      if (pos < max && state.src.slice(pos, pos + 3) === ':::') {
        autoClosed = true;
        break;
      }
    }
    
    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;
    state.parentType = 'container';
    
    // Handle details component with summary
    if (type === 'details') {
      const contentStart = startLine + 1;
      let summaryEnd = contentStart;
      
      // Find summary delimiter
      for (let i = contentStart; i < nextLine; i++) {
        const linePos = state.bMarks[i] + state.tShift[i];
        const lineMax = state.eMarks[i];
        const line = state.src.slice(linePos, lineMax).trim();
        
        if (line === '---') {
          summaryEnd = i;
          break;
        }
      }
      
      // Create tokens
      const tokenOpen = state.push('container_gds_open', 'div', 1);
      tokenOpen.info = info;
      tokenOpen.map = [startLine, nextLine];
      
      // Summary
      const summaryOpen = state.push('html_block', '', 0);
      summaryOpen.content = '<summary class="govuk-details__summary">\n<span class="govuk-details__summary-text">\n';
      
      state.lineMax = summaryEnd;
      state.md.block.tokenize(state, contentStart, summaryEnd);
      
      const summaryClose = state.push('html_block', '', 0);
      summaryClose.content = '</span>\n</summary>\n<div class="govuk-details__text">\n';
      
      // Content
      if (summaryEnd < nextLine - 1) {
        state.lineMax = nextLine;
        state.md.block.tokenize(state, summaryEnd + 1, nextLine);
      }
      
      const contentClose = state.push('html_block', '', 0);
      contentClose.content = '</div>\n';
    } else if (type === 'panel') {
      // Handle panel component - special structure needed
      const variant = info.split(' ')[1];
      
      // Create the panel wrapper
      let panelHtml = '<div class="govuk-panel';
      if (variant === 'confirmation') {
        panelHtml += ' govuk-panel--confirmation';
      }
      panelHtml += '">\n';
      
      // Find title (first non-empty line)
      let titleLine = -1;
      let contentStart = startLine + 1;
      
      for (let i = contentStart; i < nextLine; i++) {
        const linePos = state.bMarks[i] + state.tShift[i];
        const lineMax = state.eMarks[i];
        const line = state.src.slice(linePos, lineMax).trim();
        
        if (line && titleLine === -1) {
          titleLine = i;
          break;
        }
      }
      
      const openToken = state.push('html_block', '', 0);
      openToken.content = panelHtml;
      
      if (titleLine !== -1) {
        // Add title
        const titleOpenToken = state.push('html_block', '', 0);
        titleOpenToken.content = '<h1 class="govuk-panel__title">\n';
        
        // Parse title line inline content
        const titleContent = state.src.slice(
          state.bMarks[titleLine] + state.tShift[titleLine],
          state.eMarks[titleLine]
        );
        const titleToken = state.push('inline', '', 0);
        titleToken.content = titleContent.trim();
        titleToken.map = [titleLine, titleLine + 1];
        titleToken.children = [];
        state.md.inline.tokenize(state);
        
        const titleCloseToken = state.push('html_block', '', 0);
        titleCloseToken.content = '\n</h1>\n';
        
        // Check if there's body content
        if (titleLine + 1 < nextLine) {
          const bodyOpenToken = state.push('html_block', '', 0);
          bodyOpenToken.content = '<div class="govuk-panel__body">\n';
          
          // Parse body content
          state.lineMax = nextLine;
          state.md.block.tokenize(state, titleLine + 1, nextLine);
          
          const bodyCloseToken = state.push('html_block', '', 0);
          bodyCloseToken.content = '</div>\n';
        }
      }
      
      const closeToken = state.push('html_block', '', 0);
      closeToken.content = '</div>\n';
      
      state.parentType = oldParent;
      state.lineMax = oldLineMax;
      state.line = nextLine + (autoClosed ? 1 : 0);
      
      return true;
    } else {
      // Regular container
      const tokenOpen = state.push('container_gds_open', 'div', 1);
      tokenOpen.info = info;
      tokenOpen.map = [startLine, nextLine];
      
      state.lineMax = nextLine;
      state.md.block.tokenize(state, startLine + 1, nextLine);
    }
    
    const tokenClose = state.push('container_gds_close', 'div', -1);
    tokenClose.info = info;
    
    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.line = nextLine + (autoClosed ? 1 : 0);
    
    return true;
  });

  // Heading renderers
  md.renderer.rules.heading_open = function(tokens, idx) {
    const token = tokens[idx];
    const tag = token.tag;
    let govukClass = '';
    
    // Map heading levels to GOV.UK classes
    switch(tag) {
      case 'h1':
        govukClass = 'govuk-heading-xl';
        break;
      case 'h2':
        govukClass = 'govuk-heading-l';
        break;
      case 'h3':
        govukClass = 'govuk-heading-m';
        break;
      case 'h4':
        govukClass = 'govuk-heading-s';
        break;
      default:
        govukClass = 'govuk-heading-s';
    }
    
    return '<' + tag + ' class="' + govukClass + '">';
  };
  
  md.renderer.rules.heading_close = function(tokens, idx) {
    return '</' + tokens[idx].tag + '>\n';
  };
  
  // Paragraph renderer - add govuk-body class only to top-level paragraphs
  // IMPORTANT: markdown-it already handles list paragraphs correctly
  // - Tight lists: no paragraph tokens generated
  // - Loose lists: paragraph tokens generated
  // We should only modify the output, not the structure
  const originalParagraphOpen = md.renderer.rules.paragraph_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  md.renderer.rules.paragraph_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    
    // Check if we're inside a list or blockquote
    let openLists = 0;
    let openBlockquotes = 0;
    
    for (let i = 0; i < idx; i++) {
      if (tokens[i].type === 'bullet_list_open' || tokens[i].type === 'ordered_list_open') {
        openLists++;
      } else if (tokens[i].type === 'bullet_list_close' || tokens[i].type === 'ordered_list_close') {
        openLists--;
      } else if (tokens[i].type === 'blockquote_open') {
        openBlockquotes++;
      } else if (tokens[i].type === 'blockquote_close') {
        openBlockquotes--;
      }
    }
    
    // If we're NOT inside a list or blockquote, add the govuk-body class
    if (openLists === 0 && openBlockquotes === 0) {
      token.attrPush(['class', 'govuk-body']);
    }
    
    // Use the original renderer to maintain proper token rendering
    return originalParagraphOpen(tokens, idx, options, env, self);
  };
  
  // Keep the default paragraph close
  md.renderer.rules.paragraph_close = md.renderer.rules.paragraph_close || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  // Link renderer
  const defaultLinkRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const aIndex = token.attrIndex('class');
    
    if (aIndex < 0) {
      token.attrPush(['class', 'govuk-link']);
    } else {
      token.attrs[aIndex][1] += ' govuk-link';
    }
    
    return defaultLinkRender(tokens, idx, options, env, self);
  };
  
  // List renderers
  md.renderer.rules.bullet_list_open = function() {
    return '<ul class="govuk-list govuk-list--bullet">\n';
  };
  
  md.renderer.rules.ordered_list_open = function(tokens, idx) {
    const token = tokens[idx];
    const start = token.attrGet('start');
    if (start !== null && start !== '1') {
      return '<ol class="govuk-list govuk-list--number" start="' + start + '">\n';
    }
    return '<ol class="govuk-list govuk-list--number">\n';
  };
  
  // Table renderers
  md.renderer.rules.table_open = function() {
    return '<table class="govuk-table">\n';
  };
  
  md.renderer.rules.thead_open = function() {
    return '<thead class="govuk-table__head">\n';
  };
  
  md.renderer.rules.tbody_open = function() {
    return '<tbody class="govuk-table__body">\n';
  };
  
  md.renderer.rules.tr_open = function() {
    return '<tr class="govuk-table__row">\n';
  };
  
  md.renderer.rules.th_open = function(tokens, idx) {
    const token = tokens[idx];
    let align = '';
    if (token.attrGet('style')) {
      align = ' ' + token.attrGet('style');
    }
    return '<th class="govuk-table__header"' + align + '>';
  };
  
  md.renderer.rules.td_open = function(tokens, idx) {
    const token = tokens[idx];
    let align = '';
    if (token.attrGet('style')) {
      align = ' ' + token.attrGet('style');
    }
    return '<td class="govuk-table__cell"' + align + '>';
  };

  // Mermaid diagram support
  // Store original fence renderer
  const originalFence = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const info = token.info || '';
    const langName = info.trim().toLowerCase();
    
    // Check if this is a mermaid block
    if (langName === 'mermaid' || langName.startsWith('mermaid ')) {
      // Return Mermaid container with GOV.UK styling
      return '<div class="govuk-!-margin-top-6 govuk-!-margin-bottom-6">\n' +
             '<pre class="mermaid">' +
             token.content +
             '</pre>\n' +
             '</div>\n';
    }
    
    // Default fence rendering for other code blocks
    return originalFence(tokens, idx, options, env, self);
  };
  
  // Button renderer
  md.renderer.rules.gds_button = function(tokens, idx) {
    const token = tokens[idx];
    const variant = token.variant;
    const text = token.content;
    const href = token.href || '#';
    
    let classes = 'govuk-button';
    if (variant === 'secondary') {
      classes += ' govuk-button--secondary';
    } else if (variant === 'warning') {
      classes += ' govuk-button--warning';
    } else if (variant === 'start') {
      classes += ' govuk-button--start';
    }
    
    let html = '<a href="' + href + '" class="' + classes + '" data-module="govuk-button">' + text;
    if (variant === 'start') {
      html += '<svg class="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">';
      html += '<path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"/>';
      html += '</svg>';
    }
    html += '</a>';
    
    return html;
  };

  // Tag renderer
  md.renderer.rules.gds_tag = function(tokens, idx) {
    const token = tokens[idx];
    const variant = token.variant;
    const text = token.content;
    
    let classes = 'govuk-tag';
    const validColors = ['grey', 'green', 'turquoise', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow'];
    if (variant && validColors.includes(variant)) {
      classes += ' govuk-tag--' + variant;
    }
    
    return '<strong class="' + classes + '">' + text + '</strong>';
  };

  // Phase banner renderer
  md.renderer.rules.gds_phase = function(tokens, idx) {
    const token = tokens[idx];
    const phase = token.phase;
    
    let html = '<div class="govuk-phase-banner">';
    html += '<p class="govuk-phase-banner__content">';
    html += '<strong class="govuk-tag govuk-phase-banner__content__tag">';
    html += phase;
    html += '</strong>';
    html += '<span class="govuk-phase-banner__text">';
    html += 'This is a new service – your <a class="govuk-link" href="#">feedback</a> will help us to improve it.';
    html += '</span>';
    html += '</p>';
    html += '</div>';
    
    return html;
  };

  // Form component renderers
  md.renderer.rules.gds_form_input = function(tokens, idx) {
    const token = tokens[idx];
    const type = token.inputType;
    const label = token.label;
    const name = token.name;
    const hint = token.hint;
    const id = name.replace(/[^a-zA-Z0-9]/g, '-');
    
    let html = '<div class="govuk-form-group">\n';
    html += '  <label class="govuk-label" for="' + id + '">\n    ' + label + '\n  </label>\n';
    
    if (hint) {
      html += '  <div id="' + id + '-hint" class="govuk-hint">\n    ' + hint + '\n  </div>\n';
    }
    
    if (type === 'text' || type === 'email' || type === 'tel') {
      const inputType = type === 'text' ? 'text' : type;
      html += '  <input class="govuk-input" id="' + id + '" name="' + name + '" type="' + inputType + '"';
      if (hint) html += ' aria-describedby="' + id + '-hint"';
      html += '>\n';
    } else if (type === 'textarea') {
      html += '  <textarea class="govuk-textarea" id="' + id + '" name="' + name + '" rows="5"';
      if (hint) html += ' aria-describedby="' + id + '-hint"';
      html += '></textarea>\n';
    }
    
    html += '</div>';
    return html;
  };

  // Radio button renderer
  md.renderer.rules.gds_radio = function(tokens, idx) {
    const token = tokens[idx];
    const label = token.label;
    const name = token.name;
    const value = token.value;
    const hint = token.hint;
    const id = name + '-' + value.replace(/[^a-zA-Z0-9]/g, '-');
    
    let html = '<div class="govuk-radios__item">\n';
    html += '  <input class="govuk-radios__input" id="' + id + '" name="' + name + '" type="radio" value="' + value + '"';
    if (hint) html += ' aria-describedby="' + id + '-item-hint"';
    html += '>\n';
    html += '  <label class="govuk-label govuk-radios__label" for="' + id + '">\n    ' + label + '\n  </label>\n';
    
    if (hint) {
      html += '  <div id="' + id + '-item-hint" class="govuk-hint govuk-radios__hint">\n    ' + hint + '\n  </div>\n';
    }
    
    html += '</div>';
    return html;
  };

  // Checkbox renderer
  md.renderer.rules.gds_checkbox = function(tokens, idx) {
    const token = tokens[idx];
    const label = token.label;
    const name = token.name;
    const value = token.value;
    const hint = token.hint;
    const id = name + '-' + value.replace(/[^a-zA-Z0-9]/g, '-');
    
    let html = '<div class="govuk-checkboxes__item">\n';
    html += '  <input class="govuk-checkboxes__input" id="' + id + '" name="' + name + '" type="checkbox" value="' + value + '"';
    if (hint) html += ' aria-describedby="' + id + '-item-hint"';
    html += '>\n';
    html += '  <label class="govuk-label govuk-checkboxes__label" for="' + id + '">\n    ' + label + '\n  </label>\n';
    
    if (hint) {
      html += '  <div id="' + id + '-item-hint" class="govuk-hint govuk-checkboxes__hint">\n    ' + hint + '\n  </div>\n';
    }
    
    html += '</div>';
    return html;
  };

  // Select renderer
  md.renderer.rules.gds_select = function(tokens, idx) {
    const token = tokens[idx];
    const label = token.label;
    const name = token.name;
    const options = token.options;
    const hint = token.hint;
    const id = name.replace(/[^a-zA-Z0-9]/g, '-');
    
    let html = '<div class="govuk-form-group">\n';
    html += '  <label class="govuk-label" for="' + id + '">\n    ' + label + '\n  </label>\n';
    
    if (hint) {
      html += '  <div id="' + id + '-hint" class="govuk-hint">\n    ' + hint + '\n  </div>\n';
    }
    
    html += '  <select class="govuk-select" id="' + id + '" name="' + name + '"';
    if (hint) html += ' aria-describedby="' + id + '-hint"';
    html += '>\n';
    
    // Add a default empty option
    html += '    <option value="">Select an option</option>\n';
    
    // Split options and create option elements
    const optionList = options.split(',').map(function(opt) { return opt.trim(); });
    optionList.forEach(function(option) {
      const optionValue = option.toLowerCase().replace(/\s+/g, '-');
      html += '    <option value="' + optionValue + '">' + option + '</option>\n';
    });
    
    html += '  </select>\n';
    html += '</div>';
    return html;
  };

  // Radio group wrapper renderers
  md.renderer.rules.gds_radio_group_open = function(tokens, idx) {
    const token = tokens[idx];
    const legend = token.legend;
    const hint = token.hint;
    const name = token.name;
    const id = name.replace(/[^a-zA-Z0-9]/g, '-');
    
    let html = '<div class="govuk-form-group">\n';
    html += '  <fieldset class="govuk-fieldset"';
    if (hint) html += ' aria-describedby="' + id + '-hint"';
    html += '>\n';
    html += '    <legend class="govuk-fieldset__legend">\n';
    html += '      ' + legend + '\n';
    html += '    </legend>\n';
    
    if (hint) {
      html += '    <div id="' + id + '-hint" class="govuk-hint">\n      ' + hint + '\n    </div>\n';
    }
    
    html += '    <div class="govuk-radios" data-module="govuk-radios">\n';
    
    return html;
  };

  md.renderer.rules.gds_radio_group_close = function() {
    return '    </div>\n  </fieldset>\n</div>';
  };

  // Checkbox group wrapper renderers
  md.renderer.rules.gds_checkbox_group_open = function(tokens, idx) {
    const token = tokens[idx];
    const legend = token.legend;
    const hint = token.hint;
    const name = token.name;
    const id = name.replace(/[^a-zA-Z0-9]/g, '-');
    
    let html = '<div class="govuk-form-group">\n';
    html += '  <fieldset class="govuk-fieldset"';
    if (hint) html += ' aria-describedby="' + id + '-hint"';
    html += '>\n';
    html += '    <legend class="govuk-fieldset__legend">\n';
    html += '      ' + legend + '\n';
    html += '    </legend>\n';
    
    if (hint) {
      html += '    <div id="' + id + '-hint" class="govuk-hint">\n      ' + hint + '\n    </div>\n';
    }
    
    html += '    <div class="govuk-checkboxes" data-module="govuk-checkboxes">\n';
    
    return html;
  };

  md.renderer.rules.gds_checkbox_group_close = function() {
    return '    </div>\n  </fieldset>\n</div>';
  };

  // Override inline parsing
  const originalInline = md.inline.ruler.__rules__[0].fn;
  md.inline.ruler.at('text', function(state, silent) {
    const pos = state.pos;
    const src = state.src;
    const max = state.posMax;
    
    // Check for button pattern
    const buttonMatch = /^\[!button(?::(\w+))?\s+([^\]]+)\](?:\(([^)]+)\))?/.exec(src.slice(pos));
    if (buttonMatch) {
      if (!silent) {
        const token = state.push('gds_button', '', 0);
        token.variant = buttonMatch[1];
        token.content = buttonMatch[2];
        token.href = buttonMatch[3];
      }
      state.pos += buttonMatch[0].length;
      return true;
    }
    
    // Check for tag pattern
    const tagMatch = /^\[!tag(?::(\w+))?\s+([^\]]+)\]/.exec(src.slice(pos));
    if (tagMatch) {
      if (!silent) {
        const token = state.push('gds_tag', '', 0);
        token.variant = tagMatch[1];
        token.content = tagMatch[2];
      }
      state.pos += tagMatch[0].length;
      return true;
    }
    
    // Check for phase pattern
    const phaseMatch = /^\[!phase:(\w+)\]/.exec(src.slice(pos));
    if (phaseMatch) {
      if (!silent) {
        const token = state.push('gds_phase', '', 0);
        token.phase = phaseMatch[1];
      }
      state.pos += phaseMatch[0].length;
      return true;
    }
    
    // Check for input pattern
    const inputMatch = /^\[!input:(\w+)\s+"([^"]+)"\s+name="([^"]+)"(?:\s+hint="([^"]+)")?\]/.exec(src.slice(pos));
    if (inputMatch) {
      if (!silent) {
        const token = state.push('gds_form_input', '', 0);
        token.inputType = inputMatch[1];
        token.label = inputMatch[2];
        token.name = inputMatch[3];
        token.hint = inputMatch[4];
      }
      state.pos += inputMatch[0].length;
      return true;
    }
    
    // Check for radio pattern
    const radioMatch = /^\[!radio\s+"([^"]+)"\s+name="([^"]+)"\s+value="([^"]+)"(?:\s+hint="([^"]+)")?\]/.exec(src.slice(pos));
    if (radioMatch) {
      if (!silent) {
        const token = state.push('gds_radio', '', 0);
        token.label = radioMatch[1];
        token.name = radioMatch[2];
        token.value = radioMatch[3];
        token.hint = radioMatch[4];
      }
      state.pos += radioMatch[0].length;
      return true;
    }
    
    // Check for checkbox pattern
    const checkboxMatch = /^\[!checkbox\s+"([^"]+)"\s+name="([^"]+)"\s+value="([^"]+)"(?:\s+hint="([^"]+)")?\]/.exec(src.slice(pos));
    if (checkboxMatch) {
      if (!silent) {
        const token = state.push('gds_checkbox', '', 0);
        token.label = checkboxMatch[1];
        token.name = checkboxMatch[2];
        token.value = checkboxMatch[3];
        token.hint = checkboxMatch[4];
      }
      state.pos += checkboxMatch[0].length;
      return true;
    }
    
    // Check for select pattern
    const selectMatch = /^\[!select\s+"([^"]+)"\s+name="([^"]+)"\s+options="([^"]+)"(?:\s+hint="([^"]+)")?\]/.exec(src.slice(pos));
    if (selectMatch) {
      if (!silent) {
        const token = state.push('gds_select', '', 0);
        token.label = selectMatch[1];
        token.name = selectMatch[2];
        token.options = selectMatch[3];
        token.hint = selectMatch[4];
      }
      state.pos += selectMatch[0].length;
      return true;
    }
    
    // Fall back to original inline rule
    return originalInline(state, silent);
  });

  // Add block rules for radio and checkbox groups
  md.block.ruler.before('paragraph', 'gds_radio_group', function(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];
    
    // Check for radio group start
    const radioGroupMatch = /^:::radio-group\s+"([^"]+)"\s+name="([^"]+)"(?:\s+hint="([^"]+)")?/.exec(state.src.slice(pos, max));
    if (radioGroupMatch) {
      if (silent) return true;
      
      // Find closing marker
      let nextLine = startLine;
      let found = false;
      
      while (nextLine < endLine) {
        nextLine++;
        if (nextLine >= endLine) break;
        
        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        
        if (state.src.slice(pos, pos + 3) === ':::') {
          found = true;
          break;
        }
      }
      
      // Create opening token
      const tokenOpen = state.push('gds_radio_group_open', 'div', 1);
      tokenOpen.legend = radioGroupMatch[1];
      tokenOpen.name = radioGroupMatch[2];
      tokenOpen.hint = radioGroupMatch[3];
      tokenOpen.map = [startLine, nextLine];
      
      // Parse content
      const oldLineMax = state.lineMax;
      state.lineMax = nextLine;
      state.md.block.tokenize(state, startLine + 1, nextLine);
      state.lineMax = oldLineMax;
      
      // Create closing token
      state.push('gds_radio_group_close', 'div', -1);
      
      state.line = nextLine + (found ? 1 : 0);
      return true;
    }
    
    // Check for checkbox group start
    const checkboxGroupMatch = /^:::checkbox-group\s+"([^"]+)"\s+name="([^"]+)"(?:\s+hint="([^"]+)")?/.exec(state.src.slice(pos, max));
    if (checkboxGroupMatch) {
      if (silent) return true;
      
      // Find closing marker
      let nextLine = startLine;
      let found = false;
      
      while (nextLine < endLine) {
        nextLine++;
        if (nextLine >= endLine) break;
        
        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        
        if (state.src.slice(pos, pos + 3) === ':::') {
          found = true;
          break;
        }
      }
      
      // Create opening token
      const tokenOpen = state.push('gds_checkbox_group_open', 'div', 1);
      tokenOpen.legend = checkboxGroupMatch[1];
      tokenOpen.name = checkboxGroupMatch[2];
      tokenOpen.hint = checkboxGroupMatch[3];
      tokenOpen.map = [startLine, nextLine];
      
      // Parse content
      const oldLineMax = state.lineMax;
      state.lineMax = nextLine;
      state.md.block.tokenize(state, startLine + 1, nextLine);
      state.lineMax = oldLineMax;
      
      // Create closing token
      state.push('gds_checkbox_group_close', 'div', -1);
      
      state.line = nextLine + (found ? 1 : 0);
      return true;
    }
    
    return false;
  });
}

// Export the plugin
module.exports = gdsComponents;