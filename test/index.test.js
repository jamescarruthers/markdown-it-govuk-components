'use strict';

const chai = require('chai');
const expect = chai.expect;
const MarkdownIt = require('markdown-it');
const govukComponents = require('../');

describe('markdown-it-govuk-components', function() {
  let md;

  beforeEach(function() {
    md = new MarkdownIt();
    md.use(govukComponents);
  });

  describe('Headings', function() {
    it('should add GOV.UK classes to headings', function() {
      expect(md.render('# Heading 1')).to.include('class="govuk-heading-xl"');
      expect(md.render('## Heading 2')).to.include('class="govuk-heading-l"');
      expect(md.render('### Heading 3')).to.include('class="govuk-heading-m"');
      expect(md.render('#### Heading 4')).to.include('class="govuk-heading-s"');
    });
  });

  describe('Paragraphs', function() {
    it('should add govuk-body class to paragraphs', function() {
      const result = md.render('This is a paragraph.');
      expect(result).to.include('class="govuk-body"');
    });

    it('should not add govuk-body class to paragraphs inside lists', function() {
      const result = md.render('- Item 1\n\n  Paragraph in list');
      expect(result).to.include('<p>Paragraph in list</p>');
      expect(result).to.not.include('govuk-body');
    });
  });

  describe('Links', function() {
    it('should add govuk-link class to links', function() {
      const result = md.render('[GOV.UK](https://www.gov.uk)');
      expect(result).to.include('class="govuk-link"');
    });
  });

  describe('Lists', function() {
    it('should add GOV.UK classes to bullet lists', function() {
      const result = md.render('- Item 1\n- Item 2');
      expect(result).to.include('class="govuk-list govuk-list--bullet"');
    });

    it('should add GOV.UK classes to numbered lists', function() {
      const result = md.render('1. Item 1\n2. Item 2');
      expect(result).to.include('class="govuk-list govuk-list--number"');
    });
  });

  describe('Warning component', function() {
    it('should render warning text component', function() {
      const result = md.render(':::warning\nThis is a warning\n:::');
      expect(result).to.include('class="govuk-warning-text"');
      expect(result).to.include('govuk-warning-text__icon');
      expect(result).to.include('This is a warning');
    });
  });

  describe('Buttons', function() {
    it('should render basic button', function() {
      const result = md.render('[!button Click me](#)');
      expect(result).to.include('class="govuk-button"');
      expect(result).to.include('Click me');
    });

    it('should render start button with arrow', function() {
      const result = md.render('[!button:start Start now](#)');
      expect(result).to.include('class="govuk-button govuk-button--start"');
      expect(result).to.include('govuk-button__start-icon');
    });
  });

  describe('Tags', function() {
    it('should render basic tag', function() {
      const result = md.render('[!tag Alpha]');
      expect(result).to.include('class="govuk-tag"');
      expect(result).to.include('Alpha');
    });

    it('should render colored tag', function() {
      const result = md.render('[!tag:green Complete]');
      expect(result).to.include('class="govuk-tag govuk-tag--green"');
    });
  });

  describe('Form components', function() {
    it('should render text input', function() {
      const result = md.render('[!input:text "Your name" name="fullname"]');
      expect(result).to.include('class="govuk-input"');
      expect(result).to.include('type="text"');
      expect(result).to.include('Your name');
    });

    it('should render radio buttons', function() {
      const result = md.render('[!radio "Yes" name="answer" value="yes"]');
      expect(result).to.include('class="govuk-radios__input"');
      expect(result).to.include('type="radio"');
    });

    it('should render select dropdown', function() {
      const result = md.render('[!select "Choose" name="choice" options="A,B,C"]');
      expect(result).to.include('class="govuk-select"');
      expect(result).to.include('<option value="a">A</option>');
    });
  });

  describe('Mermaid diagrams', function() {
    it('should render mermaid blocks', function() {
      const result = md.render('```mermaid\ngraph TD\nA-->B\n```');
      expect(result).to.include('class="mermaid"');
      expect(result).to.include('graph TD');
    });
  });
});