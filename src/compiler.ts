import {CacheDataFunction} from '.'

// Block type enum
enum TYPE {
    TEXT = 0,
    VARIABLE = 1,
    EXPRESSION = 2,
}

enum EXPRESSION_TYPE {
    PLURAL = 0,
    SELECT = 1,
}

type PartString = [TYPE.TEXT, string]
type PartVariable = [TYPE.VARIABLE, string]
type PartExpression = [TYPE.EXPRESSION, x[], string, ExpressionCase[], EXPRESSION_TYPE]
type ExpressionCase = [string, x[]]

type x = PartString | PartVariable | PartExpression

// Helpers to parse ICU patterns
const VARIABLE_REGEXP = /^\s*\w+\s*$/
const EXPRESSION_REGEXP = /^\s*(\w+)\s*,\s*(select|plural)\s*,/i

/**
 * Helper to escape text avoiding XSS
 */
const escapeText = JSON.stringify // (text) => '"' + text.replace(/(["\\])/g, '\\$1').replace(/[\n\r]/g, '\\n') + '"';

/**
 * Helper to bind variable name to value.
 * Default to onMissingVariable returns if not defined
 *
 * Mapping :
 * - undefined -> ''
 * - null -> ''
 * - 0 -> 0
 * - 155 -> 155
 * - 'test' -> 'test'
 * - not defined -> onMissingVariable(value, key, language)
 */
const escapeVariable = (text: string): string =>
    // prettier-ignore
    '(p["' + text + '"]||(p["' + text + '"]=="0"?0:"' + text + '" in p?"":v("' + text + '",k,l)))'

/**
 * Compile the translation to executable optimized function
 */
export function compileCode(text: string): CacheDataFunction {
    const plural = {}
    const parts = parseBlocks(text)
    const code = generateCode(parts, plural)

    const pluralVars = Object.keys(plural)
    const size = pluralVars.length
    const pluralCode: string[] = []

    // Plural category cache look up
    for (let i = 0; i < size; ++i) {
        pluralCode[i] = `${pluralVars[i]}:f(p["${pluralVars[i]}"])`
    }

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return new Function(
        'a', // params
        'f', // plural category function
        'k', // key
        'l', // language
        'v', // missingVariableHandler
        `var p=a||{}${size ? `,m=f?{${pluralCode.join(`,`)}}:{}` : ``};return ${code}`,
    ) as CacheDataFunction
}

/**
 * Generate code to evaluate blocks
 */
function generateCode(parts: x[], plural: {[x: string]: number}): string {
    const codes = []
    const size = parts.length

    for (let i = 0; i < size; ++i) {
        const p = parts[i]
        const type = p[0]
        // const value = p[1]

        let code = ''

        if (type === TYPE.TEXT && p[1]) {
            code = escapeText(p[1])
        } else if (type === TYPE.VARIABLE) {
            code = escapeVariable(p[1].trim())
        } else if (type === TYPE.EXPRESSION) {
            const variable = p[2]
            const cases = p[3]
            const expressionType = p[4]
            const count = cases.length

            // Generate ternary check
            for (let j = 0; j < count; ++j) {
                if (expressionType === EXPRESSION_TYPE.PLURAL) {
                    if (cases[j][0][0] === '=') {
                        // Plural mode with '=5'
                        // Direct assignment check
                        code += 'p["' + variable + '"]==' + escapeText(cases[j][0].slice(1))
                    } else {
                        // Category check (zero, one, few, many)
                        // Send plural back so we can pre-cache the values
                        plural[variable] = 1
                        code += 'm["' + variable + '"]==' + escapeText(cases[j][0])
                    }
                } else {
                    // SELECT mode, direct assignement check
                    code += 'p["' + variable + '"]==' + escapeText(cases[j][0])
                }
                code += '?' + generateCode(cases[j][1], plural) + ':'
            }

            // Add default value
            code = '(' + code + generateCode(p[1], plural) + ')'
        }

        if (code) {
            codes.push(code)
        }
    }

    return codes.join('+') || '""'
}

/**
 * Helper to break patterns into blocks, allowing to extract texts,
 * variables and expressions and also blocks in expressions
 */
function parseBlocks(text: string): x[] {
    let stackSize = 0
    let fragment = ''
    const size = text.length
    const blocks: x[] = []

    for (let i = 0; i < size; ++i) {
        const c = text[i]
        let code: x | undefined

        if (c === '{') {
            if (!stackSize++) {
                code = [TYPE.TEXT, fragment]
            }
        } else if (c === '}') {
            if (!--stackSize) {
                code = VARIABLE_REGEXP.test(fragment)
                    ? [TYPE.VARIABLE, fragment]
                    : EXPRESSION_REGEXP.test(fragment)
                    ? parseExpression(fragment)
                    : [TYPE.TEXT, fragment]
            }
        }

        if (code) {
            blocks.push(code)
            fragment = ''
        } else {
            fragment += c
        }
    }

    blocks.push([TYPE.TEXT, fragment])

    return blocks
}

/**
 * Helper to parse expression
 * {N,plural,=0{x}=1{y}other{z}}
 * {color,select,red{x}green{y}other{z}}
 */
function parseExpression(text: string): PartExpression {
    const matches = text.match(EXPRESSION_REGEXP)
    const variable = matches?.[1] ?? ''
    const expressionType = matches?.[2][0].toLowerCase() === 'p' ? EXPRESSION_TYPE.PLURAL : EXPRESSION_TYPE.SELECT
    const parts = parseBlocks(text.replace(EXPRESSION_REGEXP, '')) as PartString[]
    const size = parts.length
    const cases: ExpressionCase[] = []

    let defaultValue: x[] = [[TYPE.TEXT, '']]

    for (let i = 0; i < size - 1; ) {
        const value = parts[i++][1].trim()
        const result = parseBlocks(parts[i++][1])

        if (value === 'other') {
            defaultValue = result
        } else if (expressionType === EXPRESSION_TYPE.PLURAL && value[0] === '=') {
            cases.unshift([value, result])
        } else {
            cases.push([value, result])
        }
    }

    return [TYPE.EXPRESSION, defaultValue, variable, cases, expressionType]
}
