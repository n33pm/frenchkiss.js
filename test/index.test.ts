import i18n from '../src/frenchkiss'

describe('locale', () => {
    it('should not bug if no locale', () => {
        expect(i18n.t('test')).toEqual('test')
    })

    it('defaults to empty string', () => {
        expect(i18n.locale()).toEqual('')
    })

    it('gets and sets locale', () => {
        i18n.locale('en')
        expect(i18n.locale()).toEqual('en')

        i18n.locale('fr')
        expect(i18n.locale()).toEqual('fr')
    })

    it('search the translation based on the locale', () => {
        i18n.set('a', {test: 'a'})
        i18n.set('b', {test: 'b'})

        i18n.locale('a')
        expect(i18n.t('test')).toEqual('a')

        i18n.locale('b')
        expect(i18n.t('test')).toEqual('b')
    })
})

describe('fallback', () => {
    afterEach(() => {
        i18n.unset('fallback')
    })

    it('defaults to empty string', () => {
        expect(i18n.fallback()).toEqual('')
    })

    it('gets and sets fallback', () => {
        i18n.fallback('en')
        expect(i18n.fallback()).toEqual('en')

        i18n.fallback('fr')
        expect(i18n.fallback()).toEqual('fr')
    })

    it('search the fallback if translation not found', () => {
        i18n.set('default', {a: 'a'})
        i18n.set('fallback', {a: '1', b: 'b'})

        i18n.locale('default')
        i18n.fallback('fallback')

        expect(i18n.t('a')).toEqual('a')
        expect(i18n.t('b')).toEqual('b')
    })
})

describe('t', () => {
    beforeEach(() => {
        i18n.locale('en')
    })

    it('translates a simple string', () => {
        i18n.set('en', {
            hello: 'Hello',
        })

        expect(i18n.t('hello')).toEqual('Hello')
    })

    it('translates numbers', () => {
        i18n.set('en', {
            a: 5,
        })

        expect(i18n.t('a')).toEqual('5')
    })

    it('interpolates', () => {
        i18n.set('en', {
            hello: 'Hi {name1} and {name2} !',
        })

        expect(
            i18n.t('hello', {
                name1: 'Vince',
                name2: 'Anna',
            }),
        ).toEqual('Hi Vince and Anna !')
    })

    it('interpolates array', () => {
        i18n.set('en', {
            hello: 'Hi {0} and {1} !',
        })

        expect(i18n.t('hello', ['Vince', 'Anna'])).toEqual('Hi Vince and Anna !')
    })

    it('interpolates with specified language (argument 3)', () => {
        i18n.set('fr', {
            hello: 'Bonjour {name1} et {name2} !',
        })

        expect(
            i18n.t(
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
        i18n.set('en', {
            hello: 'Hi {name1} and {name2} !',
        })

        expect(i18n.t('hello')).toEqual('Hi  and  !')
    })

    it('interpolates with empty string if null or undefined', () => {
        i18n.set('en', {
            hello: 'Hi {name} !',
        })

        expect(
            i18n.t('hello', {
                name: null,
            }),
        ).toEqual('Hi  !')

        expect(
            i18n.t('hello', {
                name: undefined,
            }),
        ).toEqual('Hi  !')
    })

    it('interpolates with 0 if string equal 0', () => {
        i18n.set('en', {
            msgs: '{count} message(s)',
        })

        expect(
            i18n.t('msgs', {
                count: 0,
            }),
        ).toEqual('0 message(s)')
    })

    it('interpolates the same placeholder multiple times', () => {
        i18n.set('en', {
            hello: 'Hi {name} and {name} !',
        })

        expect(i18n.t('hello', {name: 'Vince'})).toEqual('Hi Vince and Vince !')
    })

    it('interpolates plural', () => {
        i18n.set('en', {
            some_cats: 'There {N,plural,=0{is no cat} =1{is one cat} other{are {N} cats}} here.',
        })

        expect(i18n.t('some_cats', {N: 0})).toEqual('There is no cat here.')
        expect(i18n.t('some_cats', {N: 1})).toEqual('There is one cat here.')
        expect(i18n.t('some_cats', {N: 8})).toEqual('There are 8 cats here.')
    })

    it('interpolates plural with string', () => {
        i18n.set('en', {
            some_cats: 'There {N,plural,=0{is no cat} =1{is one cat} other{are {N} cats}} here.',
        })

        expect(i18n.t('some_cats', {N: '0'})).toEqual('There is no cat here.')
        expect(i18n.t('some_cats', {N: '1'})).toEqual('There is one cat here.')
        expect(i18n.t('some_cats', {N: '8'})).toEqual('There are 8 cats here.')
    })

    it('interpolates select', () => {
        i18n.set('en', {
            love_pet: 'I love my {type,select,dog{good boy} cat{evil cat} other {pet}}.',
        })

        expect(i18n.t('love_pet', {type: 'dog'})).toEqual('I love my good boy.')
        expect(i18n.t('love_pet', {type: 'cat'})).toEqual('I love my evil cat.')
        expect(i18n.t('love_pet', {type: '...'})).toEqual('I love my pet.')
    })

    it('interpolates select with string and numbers', () => {
        i18n.set('en', {
            number: 'Test {type,select,1{one} 2{two} other {infinity}}.',
        })

        expect(i18n.t('number', {type: '1'})).toEqual('Test one.')
        expect(i18n.t('number', {type: 1})).toEqual('Test one.')
        expect(i18n.t('number', {type: '2'})).toEqual('Test two.')
        expect(i18n.t('number', {type: 2})).toEqual('Test two.')
        expect(i18n.t('number', {type: '3'})).toEqual('Test infinity.')
        expect(i18n.t('number', {type: 3})).toEqual('Test infinity.')
    })

    it('interpolate with spaces', () => {
        i18n.set('en', {
            hello: 'Hello { \t\r\n  N \t\r\n ,  \t\r\n  plural \t\r\n  , \t\r\n  =0 \t\r\n  {me} \t\r\n  =1 \t\r\n  {you} \t\r\n other \t\r\n {all { \t\r\n N \t\r\n } guys} \t\r\n }.',
        })
        expect(i18n.t('hello', {N: 0})).toEqual('Hello me.')
        expect(i18n.t('hello', {N: 1})).toEqual('Hello you.')
        expect(i18n.t('hello', {N: 10})).toEqual('Hello all 10 guys.')
    })

    it('interpolate without spaces', () => {
        i18n.set('en', {
            hello: 'Hello {N,plural,=0{me}=1{you}other{all {N} guys}}.',
        })
        expect(i18n.t('hello', {N: 0})).toEqual('Hello me.')
        expect(i18n.t('hello', {N: 1})).toEqual('Hello you.')
        expect(i18n.t('hello', {N: 10})).toEqual('Hello all 10 guys.')
    })

    it('interpolate imbricated block', () => {
        i18n.set('en', {
            all_pets_color: 'All my {animal,select,cat{{color,select,G{grey }other{}}cats}other{{color,select,G{grey }other{}}dogs}}.',
        })

        expect(i18n.t('all_pets_color', {animal: 'cat', color: 'G'})).toEqual('All my grey cats.')
        expect(i18n.t('all_pets_color', {animal: 'dog', color: 'G'})).toEqual('All my grey dogs.')
        expect(i18n.t('all_pets_color', {animal: 'cat'})).toEqual('All my cats.')
        expect(i18n.t('all_pets_color', {animal: 'dog'})).toEqual('All my dogs.')
    })
})

describe('nested keys', () => {
    beforeEach(() => {
        i18n.locale('en')
    })

    describe('t', () => {
        it('translates a simple string', () => {
            i18n.set('en', {
                hello: {
                    you: 'Hello you',
                },
            })

            expect(i18n.t('hello.you')).toEqual('Hello you')
        })

        it('translates a simple sub nested string', () => {
            i18n.set('en', {
                hello: {
                    you: {
                        are: 'Hello you are',
                    },
                },
            })

            expect(i18n.t('hello.you.are')).toEqual('Hello you are')
        })

        it('does not translates object', () => {
            i18n.set('en', {
                hello: {
                    you: 'Hello you',
                },
            })

            expect(i18n.t('hello')).toEqual('hello')
        })

        it('does not TypeError on overflow', () => {
            i18n.set('en', {
                hello: {
                    you: 'Hello you',
                },
            })

            expect(i18n.t('hello.undefined.typerror')).toEqual('hello.undefined.typerror')
        })

        it('does not allow escaping', () => {
            i18n.set('en', {
                hello: {
                    you: 'Hello you',
                },
            })

            expect(i18n.t('hello.constructor.constructor.name')).toEqual('hello.constructor.constructor.name')
        })
    })

    describe('extends', () => {
        it('extends', () => {
            i18n.set('en', {
                hello: {
                    you: 'Hello you',
                },
            })

            i18n.t('hello.you')

            i18n.extend('en', {
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
        i18n.locale('en')
        i18n.fallback('xyz')
    })

    afterEach(() => {
        i18n.onMissingKey(k => k)
    })

    it('returns the key if translation not found', () => {
        expect(i18n.t('bogus_key')).toEqual('bogus_key')
    })

    it('is called with key', () => {
        const fn = jest.fn(() => '')

        i18n.onMissingKey(fn)
        i18n.t('bogus_key')

        expect(fn).toBeCalledWith('bogus_key', undefined, 'en')
    })

    it('is called with key, params, locale', () => {
        const fn = jest.fn(() => '')
        const params = {test: 5}

        i18n.onMissingKey(fn)
        i18n.t('bogus_key', params, 'en')

        expect(fn).toBeCalledWith('bogus_key', params, 'en')
    })

    it('replace the key with something custom when not found', () => {
        i18n.onMissingKey(key => 'missing:' + key)
        expect(i18n.t('bogus_key')).toEqual('missing:bogus_key')
    })

    it('does not bind empty string', () => {
        i18n.onMissingKey(key => key)
        i18n.set('en', {
            empty: '',
        })
        expect(i18n.t('empty')).toEqual('')
    })
})

describe('onMissingVariable', () => {
    beforeEach(() => {
        i18n.locale('en')
        i18n.set('en', {
            test: 'Test {value} !',
        })
    })

    afterEach(() => {
        i18n.onMissingVariable(() => '')
    })

    it('returns empty string if variable not found', () => {
        expect(i18n.t('test')).toEqual('Test  !')
    })

    it('returns empty string if variable not found', () => {
        i18n.onMissingVariable(value => `[${value}]`)
        expect(i18n.t('test', {value: ''})).toEqual('Test  !')
    })

    it('call onMissingVariable with parameters', () => {
        const fn = jest.fn(() => '')

        i18n.onMissingVariable(fn)
        i18n.t('test')

        expect(fn).toBeCalledWith('value', 'test', 'en')
    })

    it('replace the variable with something custom when not found', () => {
        i18n.onMissingVariable(value => `[${value}]`)
        expect(i18n.t('test')).toEqual('Test [value] !')
    })
})

describe('set', () => {
    beforeEach(() => {
        i18n.locale('en')
    })

    it('erase the language table', () => {
        i18n.set('en', {a: 'a', OLD_VALUE: 'b'})
        expect(i18n.t('a')).toEqual('a')

        i18n.set('en', {a: '1'})
        expect(i18n.t('a')).toEqual('1')
        expect(i18n.t('OLD_VALUE')).toEqual('OLD_VALUE')
    })

    it('should delete cache keys', () => {
        i18n.set('en', {a: 'a', b: 'b'})
        i18n.t('a')
        i18n.t('b')
        expect(i18n.cache.en.a).not.toBeUndefined()
        expect(i18n.cache.en.b).not.toBeUndefined()

        i18n.set('en', {a: 'a'})
        expect(i18n.cache.en.a).toBeUndefined()
        expect(i18n.cache.en.b).toBeUndefined()
    })
})

describe('extend', () => {
    beforeEach(() => {
        i18n.locale('en')
    })

    it('extend the language table', () => {
        i18n.extend('en', {a: 'a'})
        expect(i18n.t('a')).toEqual('a')

        i18n.extend('en', {b: 'b'})
        expect(i18n.t('a')).toEqual('a')
        expect(i18n.t('b')).toEqual('b')
    })

    it('should delete cache of erased keys', () => {
        i18n.extend('en', {a: 'a', b: 'b'})
        i18n.t('a')
        i18n.t('b')
        expect(i18n.cache.en.a).not.toBeUndefined()
        expect(i18n.cache.en.b).not.toBeUndefined()

        i18n.extend('en', {a: 'c'})
        expect(i18n.cache.en.a).toBeUndefined()
        expect(i18n.cache.en.b).not.toBeUndefined()
    })

    it('should keep cache of erased keys with same values', () => {
        i18n.extend('en', {a: 'a'})
        i18n.t('a')
        expect(i18n.cache.en.a).not.toBeUndefined()

        i18n.extend('en', {a: 'a'})
        expect(i18n.cache.en.a).not.toBeUndefined()
    })

    it('should set if no cache defined', () => {
        i18n.locale('unused')
        i18n.extend('unused', {
            hello: 'Hello',
        })
        expect(i18n.t('hello')).toEqual('Hello')
    })
})

describe('unset', () => {
    beforeEach(() => {
        i18n.locale('en')
        i18n.set('en', {a: '1'})
    })

    it('should clear table', () => {
        expect(i18n.t('a')).toEqual('1')

        i18n.unset('en')
        expect(i18n.t('a')).toEqual('a')
    })

    it('should clear compiled function', () => {
        i18n.unset('en')
        expect(i18n.cache.en).toBeUndefined()
    })
})

describe('pluralize', () => {
    it('should work', () => {
        let returnType: string

        i18n.locale('en')
        i18n.set('en', {
            test: '{N,plural,=0{r0}=5{r5}zero{rzero}one{rone}two{rtwo}few{rfew}many{rmany}other{rother}}',
        })
        i18n.plural('en', v => {
            expect(v).toEqual(18)
            return returnType
        })
        ;['zero', 'one', 'two', 'few', 'many', 'other', 'notfound'].forEach(type => {
            returnType = type
            expect(i18n.t('test', {N: 18})).toEqual('r' + (returnType === 'notfound' ? 'other' : returnType))
        })
        ;[0, 5].forEach(N => {
            i18n.plural('en', v => v)
            expect(i18n.t('test', {N})).toEqual('r' + N)
        })
    })

    it('each language has it own pluralization rules', () => {
        i18n.set('en', {
            takemymoney: 'Take {N} dollar{N, plural, one{} =5{s! Take it} other{s}} please.',
        })
        i18n.set('fr', {
            takemymoney: "Prenez {N} dollar{N, plural, one{} =5{s! Prenez le} other{s}} s'il vous plait.",
        })

        // Set here your plural category function
        i18n.plural('en', n => {
            const i = Math.floor(Math.abs(n))
            const v = n.toString().replace(/^[^.]*\.?/, '').length
            return i === 1 && v === 0 ? 'one' : 'other'
        })

        i18n.plural('fr', n => {
            const i = Math.floor(Math.abs(n))
            return i === 0 || i === 1 ? 'one' : 'other'
        })
        // etc.

        i18n.locale('en')
        expect(i18n.t('takemymoney', {N: 0})).toEqual('Take 0 dollars please.')
        expect(i18n.t('takemymoney', {N: 1})).toEqual('Take 1 dollar please.')
        expect(i18n.t('takemymoney', {N: 2})).toEqual('Take 2 dollars please.')
        expect(i18n.t('takemymoney', {N: 5})).toEqual('Take 5 dollars! Take it please.')

        i18n.locale('fr')
        expect(i18n.t('takemymoney', {N: 0})).toEqual("Prenez 0 dollar s'il vous plait.")
        expect(i18n.t('takemymoney', {N: 1})).toEqual("Prenez 1 dollar s'il vous plait.")
        expect(i18n.t('takemymoney', {N: 2})).toEqual("Prenez 2 dollars s'il vous plait.")
        expect(i18n.t('takemymoney', {N: 5})).toEqual("Prenez 5 dollars! Prenez le s'il vous plait.")
    })

    it('should respect priority', () => {
        i18n.locale('en')
        i18n.plural('en', () => 'one')
        i18n.set('en', {
            some_cats1: 'There {N,plural,=0{is no cat} one{is one cat} other{are {N} cats}} here.',
            some_cats2: 'There {N,plural,one{is one cat} =0{is no cat} other{are {N} cats}} here.',
        })

        expect(i18n.t('some_cats1', {N: 0})).toEqual('There is no cat here.')
        expect(i18n.t('some_cats1', {N: 1})).toEqual('There is one cat here.')
        expect(i18n.t('some_cats2', {N: 0})).toEqual('There is no cat here.')
        expect(i18n.t('some_cats2', {N: 1})).toEqual('There is one cat here.')
    })
})
