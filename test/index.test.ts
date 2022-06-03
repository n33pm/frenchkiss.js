import i18n, {t, locale, set, fallback, unset, extend, onMissingKey, onMissingVariable, plural} from '../src/frenchkiss'

describe('locale', () => {
    it('should not bug if no locale', () => {
        expect(t('test')).toEqual('test')
    })

    it('defaults to empty string', () => {
        expect(locale()).toEqual('')
    })

    it('gets and sets locale', () => {
        locale('en')
        expect(locale()).toEqual('en')

        locale('fr')
        expect(locale()).toEqual('fr')
    })

    it('search the translation based on the locale', () => {
        set('a', {test: 'a'})
        set('b', {test: 'b'})

        locale('a')
        expect(t('test')).toEqual('a')

        locale('b')
        expect(t('test')).toEqual('b')
    })
})

describe('fallback', () => {
    afterEach(() => {
        unset('fallback')
    })

    it('defaults to empty string', () => {
        expect(fallback()).toEqual('')
    })

    it('gets and sets fallback', () => {
        fallback('en')
        expect(fallback()).toEqual('en')

        fallback('fr')
        expect(fallback()).toEqual('fr')
    })

    it('search the fallback if translation not found', () => {
        set('default', {a: 'a'})
        set('fallback', {a: '1', b: 'b'})

        locale('default')
        fallback('fallback')

        expect(t('a')).toEqual('a')
        expect(t('b')).toEqual('b')
    })
})

describe('t', () => {
    beforeEach(() => {
        locale('en')
    })

    it('translates a simple string', () => {
        set('en', {
            hello: 'Hello',
        })

        expect(t('hello')).toEqual('Hello')
    })

    it('translates numbers', () => {
        set('en', {
            a: 5,
        })

        expect(t('a')).toEqual('5')
    })

    it('interpolates', () => {
        set('en', {
            hello: 'Hi {name1} and {name2} !',
        })

        expect(
            t('hello', {
                name1: 'Vince',
                name2: 'Anna',
            }),
        ).toEqual('Hi Vince and Anna !')
    })

    it('interpolates array', () => {
        set('en', {
            hello: 'Hi {0} and {1} !',
        })

        expect(t('hello', ['Vince', 'Anna'])).toEqual('Hi Vince and Anna !')
    })

    it('interpolates with specified language (argument 3)', () => {
        set('fr', {
            hello: 'Bonjour {name1} et {name2} !',
        })

        expect(
            t(
                'hello',
                {
                    name1: 'Vince',
                    name2: 'Anna',
                },
                'fr',
            ),
        ).toEqual('Bonjour Vince et Anna !')
    })

    it('interpolates with empty string if no parameter specified', () => {
        set('en', {
            hello: 'Hi {name1} and {name2} !',
        })

        expect(t('hello')).toEqual('Hi  and  !')
    })

    it('interpolates with empty string if null or undefined', () => {
        set('en', {
            hello: 'Hi {name} !',
        })

        expect(
            t('hello', {
                name: null,
            }),
        ).toEqual('Hi  !')

        expect(
            t('hello', {
                name: undefined,
            }),
        ).toEqual('Hi  !')
    })

    it('interpolates with 0 if string equal 0', () => {
        set('en', {
            msgs: '{count} message(s)',
        })

        expect(
            t('msgs', {
                count: 0,
            }),
        ).toEqual('0 message(s)')
    })

    it('interpolates the same placeholder multiple times', () => {
        set('en', {
            hello: 'Hi {name} and {name} !',
        })

        expect(t('hello', {name: 'Vince'})).toEqual('Hi Vince and Vince !')
    })

    it('interpolates plural', () => {
        set('en', {
            some_cats: 'There {N,plural,=0{is no cat} =1{is one cat} other{are {N} cats}} here.',
        })

        expect(t('some_cats', {N: 0})).toEqual('There is no cat here.')
        expect(t('some_cats', {N: 1})).toEqual('There is one cat here.')
        expect(t('some_cats', {N: 8})).toEqual('There are 8 cats here.')
    })

    it('interpolates plural with string', () => {
        set('en', {
            some_cats: 'There {N,plural,=0{is no cat} =1{is one cat} other{are {N} cats}} here.',
        })

        expect(t('some_cats', {N: '0'})).toEqual('There is no cat here.')
        expect(t('some_cats', {N: '1'})).toEqual('There is one cat here.')
        expect(t('some_cats', {N: '8'})).toEqual('There are 8 cats here.')
    })

    it('interpolates select', () => {
        set('en', {
            love_pet: 'I love my {type,select,dog{good boy} cat{evil cat} other {pet}}.',
        })

        expect(t('love_pet', {type: 'dog'})).toEqual('I love my good boy.')
        expect(t('love_pet', {type: 'cat'})).toEqual('I love my evil cat.')
        expect(t('love_pet', {type: '...'})).toEqual('I love my pet.')
    })

    it('interpolates select with string and numbers', () => {
        set('en', {
            number: 'Test {type,select,1{one} 2{two} other {infinity}}.',
        })

        expect(t('number', {type: '1'})).toEqual('Test one.')
        expect(t('number', {type: 1})).toEqual('Test one.')
        expect(t('number', {type: '2'})).toEqual('Test two.')
        expect(t('number', {type: 2})).toEqual('Test two.')
        expect(t('number', {type: '3'})).toEqual('Test infinity.')
        expect(t('number', {type: 3})).toEqual('Test infinity.')
    })

    it('interpolate with spaces', () => {
        set('en', {
            hello: 'Hello { \t\r\n  N \t\r\n ,  \t\r\n  plural \t\r\n  , \t\r\n  =0 \t\r\n  {me} \t\r\n  =1 \t\r\n  {you} \t\r\n other \t\r\n {all { \t\r\n N \t\r\n } guys} \t\r\n }.',
        })
        expect(t('hello', {N: 0})).toEqual('Hello me.')
        expect(t('hello', {N: 1})).toEqual('Hello you.')
        expect(t('hello', {N: 10})).toEqual('Hello all 10 guys.')
    })

    it('interpolate without spaces', () => {
        set('en', {
            hello: 'Hello {N,plural,=0{me}=1{you}other{all {N} guys}}.',
        })
        expect(t('hello', {N: 0})).toEqual('Hello me.')
        expect(t('hello', {N: 1})).toEqual('Hello you.')
        expect(t('hello', {N: 10})).toEqual('Hello all 10 guys.')
    })

    it('interpolate imbricated block', () => {
        set('en', {
            all_pets_color: 'All my {animal,select,cat{{color,select,G{grey }other{}}cats}other{{color,select,G{grey }other{}}dogs}}.',
        })

        expect(t('all_pets_color', {animal: 'cat', color: 'G'})).toEqual('All my grey cats.')
        expect(t('all_pets_color', {animal: 'dog', color: 'G'})).toEqual('All my grey dogs.')
        expect(t('all_pets_color', {animal: 'cat'})).toEqual('All my cats.')
        expect(t('all_pets_color', {animal: 'dog'})).toEqual('All my dogs.')
    })
})

describe('nested keys', () => {
    beforeEach(() => {
        locale('en')
    })

    describe('t', () => {
        it('translates a simple string', () => {
            set('en', {
                hello: {
                    you: 'Hello you',
                },
            })

            expect(t('hello.you')).toEqual('Hello you')
        })

        it('translates a simple sub nested string', () => {
            set('en', {
                hello: {
                    you: {
                        are: 'Hello you are',
                    },
                },
            })

            expect(t('hello.you.are')).toEqual('Hello you are')
        })

        it('does not translates object', () => {
            set('en', {
                hello: {
                    you: 'Hello you',
                },
            })

            expect(t('hello')).toEqual('hello')
        })

        it('does not TypeError on overflow', () => {
            set('en', {
                hello: {
                    you: 'Hello you',
                },
            })

            expect(t('hello.undefined.typerror')).toEqual('hello.undefined.typerror')
        })

        it('does not allow escaping', () => {
            set('en', {
                hello: {
                    you: 'Hello you',
                },
            })

            expect(t('hello.constructor.constructor.name')).toEqual('hello.constructor.constructor.name')
        })
    })

    describe('extends', () => {
        it('extends', () => {
            set('en', {
                hello: {
                    you: 'Hello you',
                },
            })

            t('hello.you')

            extend('en', {
                hello: {
                    me: 'Hello me',
                },
            })

            expect(i18n.store.en['hello.you']).not.toBeUndefined()
            expect(i18n.store.en['hello.me']).not.toBeUndefined()
            expect(i18n.cache.en['hello.you']).not.toBeUndefined()
        })
    })
})

describe('onMissingKey', () => {
    beforeEach(() => {
        locale('en')
        fallback('xyz')
    })

    afterEach(() => {
        onMissingKey(k => k)
    })

    it('returns the key if translation not found', () => {
        expect(t('bogus_key')).toEqual('bogus_key')
    })

    it('is called with key', () => {
        const fn = jest.fn(() => '')

        onMissingKey(fn)
        t('bogus_key')

        expect(fn).toBeCalledWith('bogus_key', undefined, 'en')
    })

    it('is called with key, params, locale', () => {
        const fn = jest.fn(() => '')
        const params = {test: 5}

        onMissingKey(fn)
        t('bogus_key', params, 'en')

        expect(fn).toBeCalledWith('bogus_key', params, 'en')
    })

    it('replace the key with something custom when not found', () => {
        onMissingKey(key => 'missing:' + key)
        expect(t('bogus_key')).toEqual('missing:bogus_key')
    })

    it('does not bind empty string', () => {
        onMissingKey(key => key)
        set('en', {
            empty: '',
        })
        expect(t('empty')).toEqual('')
    })
})

describe('onMissingVariable', () => {
    beforeEach(() => {
        locale('en')
        set('en', {
            test: 'Test {value} !',
        })
    })

    afterEach(() => {
        onMissingVariable(() => '')
    })

    it('returns empty string if variable not found', () => {
        expect(t('test')).toEqual('Test  !')
    })

    it('returns empty string if variable not found', () => {
        onMissingVariable(value => `[${value}]`)
        expect(t('test', {value: ''})).toEqual('Test  !')
    })

    it('call onMissingVariable with parameters', () => {
        const fn = jest.fn(() => '')

        onMissingVariable(fn)
        t('test')

        expect(fn).toBeCalledWith('value', 'test', 'en')
    })

    it('replace the variable with something custom when not found', () => {
        onMissingVariable(value => `[${value}]`)
        expect(t('test')).toEqual('Test [value] !')
    })
})

describe('set', () => {
    beforeEach(() => {
        locale('en')
    })

    it('erase the language table', () => {
        set('en', {a: 'a', OLD_VALUE: 'b'})
        expect(t('a')).toEqual('a')

        set('en', {a: '1'})
        expect(t('a')).toEqual('1')
        expect(t('OLD_VALUE')).toEqual('OLD_VALUE')
    })

    it('should delete cache keys', () => {
        set('en', {a: 'a', b: 'b'})
        t('a')
        t('b')
        expect(i18n.cache.en.a).not.toBeUndefined()
        expect(i18n.cache.en.b).not.toBeUndefined()

        set('en', {a: 'a'})
        expect(i18n.cache.en.a).toBeUndefined()
        expect(i18n.cache.en.b).toBeUndefined()
    })
})

describe('extend', () => {
    beforeEach(() => {
        locale('en')
    })

    it('extend the language table', () => {
        extend('en', {a: 'a'})
        expect(t('a')).toEqual('a')

        extend('en', {b: 'b'})
        expect(t('a')).toEqual('a')
        expect(t('b')).toEqual('b')
    })

    it('should delete cache of erased keys', () => {
        extend('en', {a: 'a', b: 'b'})
        t('a')
        t('b')
        expect(i18n.cache.en.a).not.toBeUndefined()
        expect(i18n.cache.en.b).not.toBeUndefined()

        extend('en', {a: 'c'})
        expect(i18n.cache.en.a).toBeUndefined()
        expect(i18n.cache.en.b).not.toBeUndefined()
    })

    it('should keep cache of erased keys with same values', () => {
        extend('en', {a: 'a'})
        t('a')
        expect(i18n.cache.en.a).not.toBeUndefined()

        extend('en', {a: 'a'})
        expect(i18n.cache.en.a).not.toBeUndefined()
    })

    it('should set if no cache defined', () => {
        locale('unused')
        extend('unused', {
            hello: 'Hello',
        })
        expect(t('hello')).toEqual('Hello')
    })
})

describe('unset', () => {
    beforeEach(() => {
        locale('en')
        set('en', {a: '1'})
    })

    it('should clear table', () => {
        expect(t('a')).toEqual('1')

        unset('en')
        expect(t('a')).toEqual('a')
    })

    it('should clear compiled function', () => {
        unset('en')
        expect(i18n.cache.en).toBeUndefined()
    })
})

describe('pluralize', () => {
    it('should work', () => {
        let returnType: string

        locale('en')
        set('en', {
            test: '{N,plural,=0{r0}=5{r5}zero{rzero}one{rone}two{rtwo}few{rfew}many{rmany}other{rother}}',
        })
        plural('en', v => {
            expect(v).toEqual(18)
            return returnType
        })
        ;['zero', 'one', 'two', 'few', 'many', 'other', 'notfound'].forEach(type => {
            returnType = type
            expect(t('test', {N: 18})).toEqual('r' + (returnType === 'notfound' ? 'other' : returnType))
        })
        ;[0, 5].forEach(N => {
            plural('en', v => v)
            expect(t('test', {N})).toEqual('r' + N)
        })
    })

    it('each language has it own pluralization rules', () => {
        set('en', {
            takemymoney: 'Take {N} dollar{N, plural, one{} =5{s! Take it} other{s}} please.',
        })
        set('fr', {
            takemymoney: "Prenez {N} dollar{N, plural, one{} =5{s! Prenez le} other{s}} s'il vous plait.",
        })

        // Set here your plural category function
        plural('en', n => {
            const i = Math.floor(Math.abs(n))
            const v = n.toString().replace(/^[^.]*\.?/, '').length
            return i === 1 && v === 0 ? 'one' : 'other'
        })

        plural('fr', n => {
            const i = Math.floor(Math.abs(n))
            return i === 0 || i === 1 ? 'one' : 'other'
        })
        // etc.

        locale('en')
        expect(t('takemymoney', {N: 0})).toEqual('Take 0 dollars please.')
        expect(t('takemymoney', {N: 1})).toEqual('Take 1 dollar please.')
        expect(t('takemymoney', {N: 2})).toEqual('Take 2 dollars please.')
        expect(t('takemymoney', {N: 5})).toEqual('Take 5 dollars! Take it please.')

        locale('fr')
        expect(t('takemymoney', {N: 0})).toEqual("Prenez 0 dollar s'il vous plait.")
        expect(t('takemymoney', {N: 1})).toEqual("Prenez 1 dollar s'il vous plait.")
        expect(t('takemymoney', {N: 2})).toEqual("Prenez 2 dollars s'il vous plait.")
        expect(t('takemymoney', {N: 5})).toEqual("Prenez 5 dollars! Prenez le s'il vous plait.")
    })

    it('should respect priority', () => {
        locale('en')
        plural('en', () => 'one')
        set('en', {
            some_cats1: 'There {N,plural,=0{is no cat} one{is one cat} other{are {N} cats}} here.',
            some_cats2: 'There {N,plural,one{is one cat} =0{is no cat} other{are {N} cats}} here.',
        })

        expect(t('some_cats1', {N: 0})).toEqual('There is no cat here.')
        expect(t('some_cats1', {N: 1})).toEqual('There is one cat here.')
        expect(t('some_cats2', {N: 0})).toEqual('There is no cat here.')
        expect(t('some_cats2', {N: 1})).toEqual('There is one cat here.')
    })
})
