/* eslint-disable @typescript-eslint/no-dynamic-delete */
import {compileCode} from './compiler'

export type CacheDataFunction = (
    params?: object,
    pluralRule?: pluralRule,
    key?: string,
    language?: string,
    missingVariableHandler?: missingVariableHandler,
) => string

type pluralRule = (count: number) => string | number

type missingVariableHandler = (variable: string, key: string, language: string) => string

type TMissingKeyHandler = (key: string, params?: ITranslationParams, language?: string) => string

type CacheData = Record<string, CacheDataFunction>

type CacheItems = Record<string, CacheData>

interface ITranslationObject {
    [key: string]: string | number | ITranslationObject | null | undefined
}

type ITranslationParams = ITranslationObject | string[]

interface ITranslationsInput {
    [key: string]: ITranslationsInput | string | number
}

type ITranslationStore = Record<string, string>

type ITranslationLangStore = Record<string, ITranslationStore>

const cache: CacheItems = {}
const store: ITranslationLangStore = {}

const _plural: {[lang: string]: pluralRule} = {}
let _locale = ''
let _fallback = ''

/**
 * Default function used in case of missing key
 * Returns the translation you want
 */
let missingKeyHandler: TMissingKeyHandler = (key: string): string => key

/**
 * Default function used in case of missing variable
 * Returns the value you want
 */
let defaultMissingVariableHandler: missingVariableHandler = (): string => ''

/**
 * Get compiled code from cache or ask to generate it
 */
const getCompiledCode = (key: string, language: string): CacheDataFunction | null =>
    (cache[language] && cache[language][key]) ||
    (store[language] && typeof store[language][key] === 'string' && (cache[language][key] = compileCode(store[language][key])))

/**
 * Get back translation and interpolate values stored in 'params' parameter
 */
export const t = (key: string, params?: ITranslationParams, language?: string): string => {
    let lang = language || _locale
    let fn: CacheDataFunction | null

    // Try to get the specified or locale
    if (lang) {
        fn = getCompiledCode(key, lang)

        if (fn) {
            return fn(params, _plural[lang], key, lang, defaultMissingVariableHandler)
        }
    }

    lang = _fallback

    // Try to get the fallback language
    if (lang) {
        fn = getCompiledCode(key, lang)

        if (fn) {
            return fn(params, _plural[lang], key, lang, defaultMissingVariableHandler)
        }
    }

    return missingKeyHandler(key, params, language ?? _locale)
}

/**
 * Set a function to handle missing key to :
 * - Returns the translation you want
 * - Report the problem to your server
 */
export const onMissingKey = (fn: TMissingKeyHandler) => {
    missingKeyHandler = fn
}

/**
 * Set a function to handle missing variable to:
 * - Returns the value you want
 * - Report the poblem to your server
 */
export const onMissingVariable = (fn: missingVariableHandler) => {
    defaultMissingVariableHandler = fn
}

/**
 * Getter/setter for locale
 */
export const locale = (language?: string): string => {
    if (language) {
        _locale = language
    }
    return _locale
}

/**
 * Getter/setter for fallback
 */
export const fallback = (language?: string): string => {
    if (language) {
        _fallback = language
    }
    return _fallback
}

/**
 * Set table for specific language
 */
export const set = (language: string, table: ITranslationsInput) => {
    cache[language] = {}
    store[language] = flattenObjectKeys(table, '')
}

/**
 * Flatten keys for flat object ITranslations
 */
const flattenObjectKeys = (data: ITranslationsInput, prefix: string): ITranslationStore => {
    let table = {} as ITranslationStore
    const keys = Object.keys(data)
    const count = keys.length

    for (let i = 0; i < count; ++i) {
        const key = keys[i]
        const prefixKey = prefix + key

        if (typeof data[key] === 'object') {
            table = Object.assign(table, flattenObjectKeys(data[key] as ITranslationsInput, prefixKey + '.'))
        } else {
            table[prefixKey] = String(data[key])
        }
    }
    return table
}

/**
 * Set plural category function
 * The function get the value as argument and you specify the group to returns
 * It can be "one", "few", "many" or in fact everything else you want.
 */
export const plural = (language: string, pluralRule: pluralRule) => {
    _plural[language] = pluralRule
}

/**
 * Extend language table without reseting the stored data
 */
export const extend = (language: string, table: ITranslationsInput) => {
    if (!store[language]) store[language] = {}
    if (!cache[language]) cache[language] = {}

    extendStoreRecursive(store[language], cache[language], table, '')
}

/**
 * Helper to extends store recursively
 */
const extendStoreRecursive = (store: ITranslationStore, cache: CacheData, table: ITranslationsInput, prefix: string) => {
    const keys = Object.keys(table)
    const count = keys.length

    for (let i = 0; i < count; ++i) {
        const key = keys[i]
        const targetKey = prefix + key

        if (typeof table[key] === 'object') {
            extendStoreRecursive(store, cache, table[key] as ITranslationsInput, targetKey + '.')
        } else if (store[targetKey] !== table[key]) {
            delete cache[targetKey]
            store[targetKey] = String(table[key])
        }
    }
}

/**
 * Clear language table
 */
export const unset = (language: string) => {
    delete cache[language]
    delete store[language]
}

/**
 * Export all as default
 */
export default {
    cache,
    store,
}
