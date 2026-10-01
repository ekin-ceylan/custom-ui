/**
 * A generic type that represents any class constructor.
 * @template T
 * @typedef {new (...args: any[]) => T} Constructor
 */

/**
 * Generic mixin type.
 *
 * `TBase` static tarafı taşır.
 * `TAdded` mixin'in instance tarafına eklediği API'yi temsil eder.
 *
 * @template {Constructor<any>} TBase
 * @template {object} TAdded
 * @typedef {(Base: TBase) => TBase & Constructor<InstanceType<TBase> & TAdded>} ClassMixin
 */

/**
 * @template {Constructor<any>} TBase
 * @template {object} M1
 * @overload
 * @param {TBase} BaseClass
 * @param {ClassMixin<TBase, M1>} m1
 * @returns {TBase & Constructor<InstanceType<TBase> & M1>}
 */

/**
 * @template {Constructor<any>} TBase
 * @template {object} M1
 * @template {object} M2
 * @overload
 * @param {TBase} BaseClass
 * @param {ClassMixin<TBase, M1>} m1
 * @param {ClassMixin<TBase, M2>} m2
 * @returns {TBase & Constructor<InstanceType<TBase> & M2 & M1>}
 */

/**
 * @template {Constructor<any>} TBase
 * @template {object} M1
 * @template {object} M2
 * @template {object} M3
 * @overload
 * @param {TBase} BaseClass
 * @param {ClassMixin<TBase, M1>} m1
 * @param {ClassMixin<TBase, M2>} m2
 * @param {ClassMixin<TBase, M3>} m3
 * @returns {TBase & Constructor<InstanceType<TBase> & M3 & M2 & M1>}
 */

/**
 * Applies one or more mixins to the given base class.
 * @param {Constructor<any>} BaseClass
 * @param {...ClassMixin<Constructor<any>, object>} mixins
 * @returns {Constructor<any>}
 */
export function mixins(BaseClass, ...mixins) {
    return mixins.reduceRight((Base, mixin) => mixin(Base), BaseClass);
}
