import {Filter, ObjectId} from 'mongodb';


export function convertStringIdsToObjectId<T>(filter: T): T {
    // 1. Handle Arrays (e.g., in a $or: [...] clause)
    if (Array.isArray(filter)) {
        return filter.map(item => convertStringIdsToObjectId(item)) as T;
    }

    // 2. Handle Objects (e.g., the main filter object or nested fields)
    if (typeof filter === 'object' && filter !== null) {
        // Create a new object to hold the converted fields
        const newFilter = {} as Record<string, any>;

        for (const key in filter) {
            if (Object.prototype.hasOwnProperty.call(filter, key)) {
                const value = (filter as Record<string, any>)[key];

                // Check if the value is a string and a valid ObjectId
                if (typeof value === 'string' && ObjectId.isValid(value)) {
                    // Convert the string to an ObjectId object
                    newFilter[key] = new ObjectId(value);
                }
                // Recursively call for nested objects/arrays
                else if (typeof value === 'object' && value !== null) {
                    newFilter[key] = convertStringIdsToObjectId(value);
                }
                // Copy all other types (numbers, booleans, non-ID strings) directly
                else {
                    newFilter[key] = value;
                }
            }
        }
        return newFilter as T;
    }

    // 3. Handle Primitives (strings, numbers, booleans)
    return filter;
}


/**
 * Separates a potential userId filter from an array of MongoDB filters.
 * Assumes the userId filter looks like: { 'jobApplicationDetails.userId': <value> }
 * * @param filters An array of MongoDB Filter objects.
 * @returns An object containing the extracted userId filter and the rest of the filters.
 */
export function separateUserIdFilterObject<F>(filterObject: Filter<F> | undefined) {
    // 1. Handle missing or empty filters
    if (!filterObject || Object.keys(filterObject).length === 0) {
        return {
            extractedUserId: null,
            otherFilters: {} as Filter<F>
        };
    }

    if ("userId" in filterObject) {
        const {userId, ...otherFilters} = filterObject;
        return {extractedUserId: userId, otherFilters}
    }

    return {extractedUserId: null, otherFilters: filterObject}
}
