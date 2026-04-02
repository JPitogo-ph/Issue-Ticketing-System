import {describe, it, expect} from 'vitest';
import { assertValidTransition,canChangeStatus, availableTransitions, isTerminal } from './ticket.statemachine.js';

describe('isTerminal', () => {
    it('returns true for closed', () => {
        expect(isTerminal('closed')).toBe(true);
    });

    it('returns false for all other statuses', () => {
        const nonTerminal = ['open', 'in_progress', 'in_review', 'resolved'];
        nonTerminal.forEach(s => expect(isTerminal(s as any)).toBe(false));
    });
});

describe('canChangeStatus', () => {
    it('returns true for agent and admin', () => {
        expect(canChangeStatus('agent')).toBe(true);
        expect(canChangeStatus('admin')).toBe(true);
    });

    it('returns false for reporter', () => {
        expect(canChangeStatus('reporter')).toBe(false);
    });
});

describe('availableTransitions', () => {
    it('returns correct transitions from open', () => {
        expect(availableTransitions('open')).toEqual(
            expect.arrayContaining(['in_progress', 'closed'])
        );
    });

    it('returns empty array from closed/terminal', () => {
        expect(availableTransitions('closed')).toHaveLength(0);
    });
});

describe('assertValidTransition', () => {
    it('should not throw for valid transition', () => {
        expect(() => assertValidTransition('open', 'in_progress')).not.toThrow();
    });

    it('should throw 422 for invalid transition', () => {
        expect(() => assertValidTransition('closed', 'open')).toThrow();
    });

    it('should throw object with statusCode: 422', () => {
        try {
            assertValidTransition('closed', 'open');
        } catch (err: any) {
            expect(err.statusCode).toBe(422);
        }
    })
})