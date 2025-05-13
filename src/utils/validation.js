export function validateGraph(graph) {
    const diagnostics = {
        noRepeatedNames: true,
        noRepeatedAttrNames: true,
        noEntitiesWithoutAttributes: true,
        noEntitiesWithoutPK: true,
        noEntitiesWithMoreThanOnePK: true,
        noNMRelationsWithPK: true,
        noUnconnectedRelations: true,
        noNotValidCardinalities: true,
        notEmpty: true,
        isValid: true,
        noInvalidRelationNames: true,
        // weak entities
        noWeakEntityWithPrimaryKey: true,
        noWeakEntityInvalidRelationCount: true,
        noWeakEntityWrongCardinality: true,
        noWeakEntityNoDiscriminant: true,
        noWeakEntityConnectedToNonIdentifyingRelation: true,
    };

    // The graph is empty
    if (graph.entities.length === 0 && graph.relations.length === 0) {
        diagnostics.notEmpty = false;
        diagnostics.isValid = false;
    }

    // Check for repeated entity names
    if (repeatedEntities(graph)) {
        diagnostics.noRepeatedNames = false;
        diagnostics.isValid = false;
    }

    // Check for repeated attribute names in the same entity
    if (repeatedAttributesInEntity(graph)) {
        diagnostics.noRepeatedAttrNames = false;
        diagnostics.isValid = false;
    }

    // Check for entities without attributes
    if (entitiesWithoutAttributes(graph)) {
        diagnostics.noEntitiesWithoutAttributes = false;
        diagnostics.isValid = false;
    }

    // Check for entities without a primary key attribute
    if (entitiesWithoutPK(graph)) {
        diagnostics.noEntitiesWithoutPK = false;
        diagnostics.isValid = false;
    }

    // Check for entities with more than one primary key
    if (entitiesWithMoreThanOnePK(graph)) {
        diagnostics.noEntitiesWithMoreThanOnePK = false;
        diagnostics.isValid = false;
    }

    // Check for NM relations with a primary key
    if (nmRelationsWithPK(graph)) {
        diagnostics.noNMRelationsWithPK = false;
        diagnostics.isValid = false;
    }

    // Check for unconnected relations
    if (relationsUnconnected(graph)) {
        diagnostics.noUnconnectedRelations = false;
        diagnostics.isValid = false;
    }

    // Check for relations with invalid cardinalities
    if (cardinalitiesNotValid(graph)) {
        diagnostics.noNotValidCardinalities = false;
        diagnostics.isValid = false;
    }

    if (invalidRelationNames(graph)) {
        diagnostics.noInvalidRelationNames = false;
        diagnostics.isValid = false;
    }

    if (weakEntityHasPrimaryKey(graph)) {
        diagnostics.noWeakEntityWithPrimaryKey = false;
        diagnostics.isValid = false;
    }

    if (weakEntityInvalidRelationCount(graph)) {
        diagnostics.noWeakEntityInvalidRelationCount = false;
        diagnostics.isValid = false;
    }

    if (weakEntityWrongCardinality(graph)) {
        diagnostics.noWeakEntityWrongCardinality = false;
        diagnostics.isValid = false;
    }

    if (weakEntityNoDiscriminant(graph)) {
        diagnostics.noWeakEntityNoDiscriminant = false;
        diagnostics.isValid = false;
    }

    if (noWeakEntityConnectedToNonIdentifyingRelation(graph)) {
        diagnostics.noWeakEntityConnectedToNonIdentifyingRelation = false;
        diagnostics.isValid = false;
    }

    return diagnostics;
}

// This function check for repeated entity name, relations
// can't be repeated also
// Returns true if there are repeated entity names
// false if there are not repeated entity names
export function repeatedEntities(graph) {
    const entityNames = new Set();

    for (const entity of graph.entities) {
        if (entityNames.has(entity.name)) {
            return true; // Found a duplicate name
        }
        entityNames.add(entity.name);
    }

    // Check for relations as well
    for (const relation of graph.relations) {
        if (entityNames.has(relation.name)) {
            return true; // Found a duplicate name
        }
        entityNames.add(relation.name);
    }

    return false; // No duplicates found
}

// This function checks for repeated attributes in an entity,
// relations N:M (these are the ones that have a key `canHoldAttributes`
// set to true) are also treated as entities.
// Returns true if there are repeated attribute names in any entity
// false if there are no repetitions.
// NOTE: Every entity should be treated differently; there can be repeated
// attributes in different entities.
export function repeatedAttributesInEntity(graph) {
    const hasRepeatedAttributes = (attributes) => {
        const attributeNames = new Set();
        for (const attribute of attributes) {
            if (attributeNames.has(attribute.name)) {
                return true;
            }
            attributeNames.add(attribute.name);
        }
        return false;
    };

    // Check entities for repeated attributes
    for (const entity of graph.entities) {
        if (hasRepeatedAttributes(entity.attributes)) {
            return true;
        }
    }

    // Check N:M relations for repeated attributes
    for (const relation of graph.relations) {
        if (
            relation.canHoldAttributes &&
            hasRepeatedAttributes(relation.attributes)
        ) {
            return true;
        }
    }

    return false; // No repeated attributes found in any entity or N:M relation
}

// False if every entity has at least a key
// True if there is an entity that hasn't a key
export function entitiesWithoutPK(graph) {
    // Check entities
    for (const entity of graph.entities) {
        let hasPrimaryKey = false;
        for (const attribute of entity.attributes) {
            // Check if there is at least one attribute with key set to true
            if (attribute.key) {
                hasPrimaryKey = true;
                break;
            }
        }
        // If no primary key found for the current entity, return true
        if (!hasPrimaryKey) {
            return true;
        }
    }
    // If all entities have at least one primary key, return false
    return false;
}

// True if there is an entity that has two or more keys
export function entitiesWithMoreThanOnePK(graph) {
    for (const entity of graph.entities) {
        let primaryKeyCount = 0;
        for (const attribute of entity.attributes) {
            if (attribute.key) {
                primaryKeyCount++;
                // If more than one primary key is found, return true
                if (primaryKeyCount > 1) {
                    return true;
                }
            }
        }
    }
    // If no entity with more than one primary key is found, return false
    return false;
}

// True if there is an N:M relation that has a key
export function nmRelationsWithPK(graph) {
    for (const relation of graph.relations) {
        // Check if the relation is of type N:M
        if (relation.canHaveAttributes) {
            for (const attribute of relation.attributes) {
                // If any attribute has key set to true, return true
                if (attribute.key) {
                    return true;
                }
            }
        }
    }
    // If no N:M relation with a key is found, return false
    return false;
}

export function entitiesWithoutAttributes(graph) {
    // Check entities
    for (const entity of graph.entities) {
        if (!entity.attributes || entity.attributes.length === 0) {
            return true; // Found an entity without attributes
        }
    }

    return false; // No entities or N:M relations without attributes found
}

export function relationsUnconnected(graph) {
    for (const relation of graph.relations) {
        if (
            !relation.side1.idMx ||
            !relation.side2.idMx ||
            relation.side1.idMx === "" ||
            relation.side2.idMx === ""
        ) {
            return true; // Found an unconnected relation
        }
    }
    return false; // All relations are connected
}

export function notNMRelationsWithAttributes(graph) {
    for (const relation of graph.relations) {
        if (!relation.canHoldAttributes && relation.attributes.length > 0) {
            return true; // Found an relation that cant hold attributes that holds them
        }
    }
    return false;
}

export const POSSIBLE_CARDINALITIES = ["0:1", "0:N", "1:1", "1:N"];

export function cardinalitiesNotValid(graph) {
    for (const relation of graph.relations) {
        const side1Cardinality = relation.side1.cardinality;
        const side2Cardinality = relation.side2.cardinality;

        // Check if the cardinalities are not in the possible list
        if (
            !POSSIBLE_CARDINALITIES.includes(side1Cardinality) ||
            !POSSIBLE_CARDINALITIES.includes(side2Cardinality)
        ) {
            return true; // Found an invalid cardinality
        }

        // Check if both cardinalities are 1:1
        if (side1Cardinality === "1:1" && side2Cardinality === "1:1") {
            return true; // Both cardinalities are 1:1, which is invalid
        }
    }
    return false; // All cardinalities are valid
}

export function invalidRelationNames(graph) {
    const isValidName = (name) =>
        typeof name === "string" && /^[a-zA-Z0-9 _]+$/.test(name.trim());

    return graph.relations.some((rel) => !isValidName(rel.name));
}

// True if a weak entity has a primary key
export function weakEntityHasPrimaryKey(graph) {
    for (const entity of graph.entities) {
        if (entity.isWeak) {
            for (const attribute of entity.attributes) {
                if (attribute.key) {
                    return true;
                }
            }
        }
    }
    return false;
}

// True if a weak entity has not exactly one relation
export function weakEntityInvalidRelationCount(graph) {
    for (const entity of graph.entities) {
        if (entity.isWeak) {
            let count = 0;
            for (const relation of graph.relations) {
                if (
                    relation.side1.entity.idMx === entity.idMx ||
                    relation.side2.entity.idMx === entity.idMx
                ) {
                    count++;
                }
            }
            if (count !== 1) {
                return true;
            }
        }
    }
    return false;
}

// True if the cardinalities on a weak entity relation are invalid
export function weakEntityWrongCardinality(graph) {
    for (const relation of graph.relations) {
        const side1 = relation.side1;
        const side2 = relation.side2;

        const entity1 = graph.entities.find(
            (e) => e.idMx === side1.entity.idMx,
        );
        const entity2 = graph.entities.find(
            (e) => e.idMx === side2.entity.idMx,
        );

        if (entity1?.isWeak || entity2?.isWeak) {
            const weakSide = entity1?.isWeak ? side1 : side2;
            const strongSide = entity1?.isWeak ? side2 : side1;

            if (
                !(
                    (weakSide.cardinality === "0:N" ||
                        weakSide.cardinality === "1:N") &&
                    strongSide.cardinality === "1:1"
                )
            ) {
                return true;
            }
        }
    }
    return false;
}

// True if weak entities do not have a discriminant attribute
export function weakEntityNoDiscriminant(graph) {
    for (const entity of graph.entities) {
        if (entity.isWeak) {
            const hasDiscriminant = entity.attributes.some(
                (attr) => attr.discriminant,
            );
            if (!hasDiscriminant) {
                return true;
            }
        }
    }
    return false;
}

// True if any weak entity is connected to non identifying relation
export function weakEntityConnectedToNonIdentifyingRelation(graph) {
    for (const entity of graph.entities) {
        if (entity.isWeak) {
            const relatedIdentifyingRelations = graph.relations.filter(
                (rel) =>
                    (rel.side1.entity.idMx === entity.idMx ||
                        rel.side2.entity.idMx === entity.idMx) &&
                    rel.isIdentifying,
            );
            if (relatedIdentifyingRelations.length !== 1) {
                return true;
            }
        }
    }
    return false;
}
