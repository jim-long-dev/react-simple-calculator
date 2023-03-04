import { useReducer } from 'react'
import DigitButton from './DigitButton'
import OperationButton from './OperationButton'
import './styles.css'

// actions for the reducer
// it is useful to create an actions object instead of using strings everywhere, as VSC has autocomplete that can help check that we enter the right action.
// this is especially true if the project is written in TypeScript.
// VSC does not check that your strings are typed correctly!
//! using strings to denote actions runs the risk of mistyping, which can result in heartaches of bugfixing that can run into hours!
export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  TOGGLE_NEGATIVE: 'toggle-negative',
  PERCENTAGE: 'percentage',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate',
}

// the reducer
// the action variable is destructured here:
// const { type, payload } = action
function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      // if user enters a digit again after performing a calculation, just clear the display and make the digit as the current operand
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        }
      }
      // if the digit already starts with 0, prevent user from entering more than one 0
      // for zero-point decimal numbers
      if (payload.digit === '0' && state.currentOperand === '0') {
        return state
      }
      // if user enters a period (.) first, immediately convert it to a zero-point decimal number
      // IMPORTANT: this prevents the app from crashing
      if (payload.digit === '.' && state.currentOperand == null) {
        return { ...state, currentOperand: '0.' }
      }
      // prevent user from entering more than one period
      // for decimal-point numbers
      if (payload.digit === '.' && state.currentOperand.includes('.')) {
        return state
      }
      // if above conditions are satisfied, let calculator concatenate the digits
      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${payload.digit}`,
      }

    case ACTIONS.CHOOSE_OPERATION:
      // prevent user from entering any operator first
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }
      // allow user to change the operator after entering digits and a previous operator
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }
      // if current operand exists, change it into the previous operand and empties the current operand
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }
      // if there already exists previous and current operands, and the user enters another operand, automatically perform the entered operation on the previous and current operands, transform them into the previous operand, and empties the current operand.
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      }

    case ACTIONS.TOGGLE_NEGATIVE:
      // allow user to add a negative sign after a fresh calculation
      if (state.currentOperand == null) {
        return { ...state, currentOperand: '-' }
      }
      // removes the '-' if it already exists (ie. toggles it)
      if (state.currentOperand.includes('-')) {
        return {
          ...state,
          currentOperand: state.currentOperand.replace('-', ''),
        }
      }
      // concatenates '-' with the operand
      return {
        ...state,
        currentOperand: '-' + state.currentOperand,
      }

    case ACTIONS.PERCENTAGE:
      if (state.currentOperand === '0' && state.previousOperand == null) {
        return state
      }
      if (state.currentOperand) {
        // the '+' converts a string of numbers into a number itself
        let percentageOperand = +state.currentOperand / 100
        return {
          ...state,
          // silly workaround to resolve decimal number bugs in JS
          // https://stackoverflow.com/a/10474055/14225703
          currentOperand: (
            Math.round(percentageOperand * 1e12) / 1e12
          ).toString(),
        }
      }

    case ACTIONS.CLEAR:
      // clears everything
      return {
        ...state,
        currentOperand: '0',
        previousOperand: null,
        operation: null,
      }

    case ACTIONS.DELETE_DIGIT:
      // if there is an overwrite state, the delete button automatically deletes the result and returns an empty operand
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        }
      }
      // if there is no current operand just return the previous operand or an empty one
      if (state.currentOperand == null) {
        return state
      }
      // if there is only one digit in the current operand, make it empty
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null }
      }
      // when all conditions above have been satisfied, delete the last digit or operator from the current operand.
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      }

    case ACTIONS.EVALUATE:
      // don't perform any calculations if any of these things are null - operator, current operant, previous operand
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state
      }
      // perform calculation and returns an overwrite state so that if the user enters a digit again (see above), the result is overwritten
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }
  }
}

// the core function to perform calculations
function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) {
    return ''
  }
  let result = ''
  switch (operation) {
    case '+':
      result = prev + current
      break
    case '-':
      result = prev - current
      break
    case '×':
      result = prev * current
      break
    case '÷':
      result = prev / current
      break
    case '%':
  }
  // silly workaround to resolve decimal number bugs in JS
  // https://stackoverflow.com/a/10474055/14225703
  let computation = Math.round(+result * 1e12) / 1e12
  return computation.toString()
}

// format numbers to human-readable format with commas
// decimals are not formatted
const INTEGER_FORMATTER = new Intl.NumberFormat('en-us', {
  maximumFractionDigits: 0,
})
function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split('.')
  if (decimal == null) {
    return INTEGER_FORMATTER.format(integer)
  }
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

export default function CalculatorApp() {
  // the state variable is destructured here
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    { currentOperand: '0' }
  )

  return (
    <>
      <h1>Calculator</h1>
      <div className="calculator-grid">
        <div className="output">
          <div className="previous-operand">
            {formatOperand(previousOperand)} {operation}
          </div>
          <div className="current-operand">{formatOperand(currentOperand)}</div>
        </div>
        <button onClick={() => dispatch({ type: ACTIONS.CLEAR })}>AC</button>
        <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
          DEL
        </button>
        <button onClick={() => dispatch({ type: ACTIONS.PERCENTAGE })}>
          %
        </button>
        <OperationButton operation="÷" dispatch={dispatch} />
        <DigitButton digit="1" dispatch={dispatch} />
        <DigitButton digit="2" dispatch={dispatch} />
        <DigitButton digit="3" dispatch={dispatch} />
        <OperationButton operation="×" dispatch={dispatch} />
        <DigitButton digit="4" dispatch={dispatch} />
        <DigitButton digit="5" dispatch={dispatch} />
        <DigitButton digit="6" dispatch={dispatch} />
        <OperationButton operation="+" dispatch={dispatch} />
        <DigitButton digit="7" dispatch={dispatch} />
        <DigitButton digit="8" dispatch={dispatch} />
        <DigitButton digit="9" dispatch={dispatch} />
        <OperationButton operation="-" dispatch={dispatch} />
        <button onClick={() => dispatch({ type: ACTIONS.TOGGLE_NEGATIVE })}>
          +/-
        </button>
        <DigitButton digit="." dispatch={dispatch} />
        <DigitButton digit="0" dispatch={dispatch} />
        <button onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>=</button>
      </div>
    </>
  )
}
