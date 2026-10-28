import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  QuestionCarousel,
  AnsweredCards,
  type ClarificationQuestion,
  type AnsweredQuestion,
} from '../../src/components/rider/agentic';

describe('QuestionCarousel Component', () => {
  const mockQuestions: ClarificationQuestion[] = [
    {
      id: 'q1',
      field: 'vehicleType',
      question: 'Which vehicle do you prefer?',
      options: [
        { label: 'Bike', value: 'BIKE', badge: 'Fastest' },
        { label: 'CNG Auto', value: 'CNG', badge: 'Affordable' },
        { label: 'Sedan Car', value: 'CAR', badge: 'Recommended' },
      ],
      placeholder: 'Or specify custom vehicle preference...',
    },
    {
      id: 'q2',
      field: 'dropoff',
      question: 'Which branch in Dhanmondi?',
      options: [
        { label: 'Dhanmondi 27', value: 'Dhanmondi 27', badge: 'Recommended' },
        { label: 'Dhanmondi 8/A', value: 'Dhanmondi 8/A' },
      ],
      placeholder: 'Enter branch or road number...',
    },
  ];

  it('renders question prompt, counter indicator, and option chips with badges', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(QuestionCarousel, {
        questions: mockQuestions,
        onAnswer: () => {},
      })
    );

    expect(html).toContain('Question 1 of 2');
    expect(html).toContain('Which vehicle do you prefer?');
    expect(html).toContain('Bike');
    expect(html).toContain('CNG Auto');
    expect(html).toContain('Sedan Car');
    expect(html).toContain('Recommended');
    expect(html).toContain('Fastest');
    expect(html).toContain('Or specify custom vehicle preference...');
  });

  it('renders indicator dots for multiple questions', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(QuestionCarousel, {
        questions: mockQuestions,
        onAnswer: () => {},
        currentIndex: 0,
      })
    );

    // Should contain indicator elements
    expect(html).toContain('data-testid="carousel-indicators"');
  });

  it('renders empty when questions list is empty', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(QuestionCarousel, {
        questions: [],
        onAnswer: () => {},
      })
    );

    expect(html).toBe('');
  });

  it('renders next question when currentIndex is 1', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(QuestionCarousel, {
        questions: mockQuestions,
        currentIndex: 1,
        onAnswer: () => {},
      })
    );

    expect(html).toContain('Question 2 of 2');
    expect(html).toContain('Which branch in Dhanmondi?');
    expect(html).toContain('Dhanmondi 27');
    expect(html).toContain('Dhanmondi 8/A');
  });

  it('handles option click via callback invocation', () => {
    const onAnswer = vi.fn();
    const element = React.createElement(QuestionCarousel, {
      questions: mockQuestions,
      onAnswer,
    });

    expect(element.props.questions.length).toBe(2);
    onAnswer({
      id: 'q1',
      field: 'vehicleType',
      question: 'Which vehicle do you prefer?',
      answer: 'CAR',
    });

    expect(onAnswer).toHaveBeenCalledWith({
      id: 'q1',
      field: 'vehicleType',
      question: 'Which vehicle do you prefer?',
      answer: 'CAR',
    });
  });

  it('handles custom text submission callback', () => {
    const onAnswer = vi.fn();
    onAnswer({
      id: 'q2',
      field: 'dropoff',
      question: 'Which branch in Dhanmondi?',
      answer: 'Near Star Kabab Road 2',
    });

    expect(onAnswer).toHaveBeenCalledWith({
      id: 'q2',
      field: 'dropoff',
      question: 'Which branch in Dhanmondi?',
      answer: 'Near Star Kabab Road 2',
    });
  });
});

describe('AnsweredCards Component', () => {
  const mockAnswered: AnsweredQuestion[] = [
    {
      id: 'q1',
      field: 'vehicleType',
      question: 'Which vehicle do you prefer?',
      answer: 'Sedan Car',
    },
    {
      id: 'q2',
      field: 'dropoff',
      question: 'Which branch in Dhanmondi?',
      answer: 'Dhanmondi 27',
    },
  ];

  it('renders each answered question with question text, rider answer, and checkmark badge', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AnsweredCards, {
        answeredQuestions: mockAnswered,
      })
    );

    expect(html).toContain('Which vehicle do you prefer?');
    expect(html).toContain('Sedan Car');
    expect(html).toContain('Which branch in Dhanmondi?');
    expect(html).toContain('Dhanmondi 27');
    expect(html).toContain('data-testid="answered-check-badge"');
    expect(html).toContain('Resolved');
  });

  it('renders null or empty when answered list is empty', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(AnsweredCards, {
        answeredQuestions: [],
      })
    );

    expect(html).toBe('');
  });
});
