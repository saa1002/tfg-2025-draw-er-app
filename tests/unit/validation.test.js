import { beforeEach, describe, expect, test } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { 
    repeatedAttributesInEntity, 
    repeatedEntities, 
    entitiesWithoutAttributes,
    relationsUnconnected,
    validateGraph, 
    cardinalitiesNotValid,
    notNMRelationsWithAttributes,
    invalidRelationNames,
    weakEntityHasPrimaryKey,
    weakEntityInvalidRelationCount,
    weakEntityWrongCardinality,
    weakEntityNoDiscriminant,
    weakEntityConnectedToNonIdentifyingRelation,
    weakEntityRelationNotConnectedToStrong,
} from "../../src/utils/validation"

let graph;

beforeEach(() => {
  // Load fresh data before each test
  const data = readFileSync(resolve(__dirname, './graphs/example.json'), 'utf-8');
  graph = JSON.parse(data);
});

describe("General validation function", () => {
    test("correct graph return true", () => {
        expect(validateGraph(graph).isValid).toBe(true)
    })
})

describe('Non repeated entity or n:m relation name', ()=> {
    test("entities can't have repeated names", () => {
        expect(repeatedEntities(graph)).toBe(false);
        // Access an entity and set its name to an already existing entity name
        graph.entities.at(1).name = graph.entities.at(0).name
        expect(repeatedEntities(graph)).toBe(true);
        expect(validateGraph(graph).noRepeatedNames).toBe(false)
    })

    test("N:M relations and entities can't have repeated names", () => {
        expect(repeatedEntities(graph)).toBe(false);
        // Access the N:M relation and set its name to an already existing entity name
        graph.relations.at(0).name = graph.entities.at(0).name
        expect(repeatedEntities(graph)).toBe(true);
        expect(validateGraph(graph).noRepeatedNames).toBe(false)
    })
})

describe("Non repeated attributes in entities or n:m relations", ()=> {
    test("entities can't have repeated attributes names", () => {
        expect(repeatedAttributesInEntity(graph)).toBe(false);
        // Set an attribute in an entity to the same name of other
        graph.entities.at(0).attributes.at(1).name = graph.entities.at(0).attributes.at(0).name
        expect(repeatedAttributesInEntity(graph)).toBe(true);
        expect(validateGraph(graph).noRepeatedAttrNames).toBe(false)
    })

    test("N:M relations can't have repeated attributes names", () => {
        // Test the graph without repeated attributes
        expect(repeatedAttributesInEntity(graph)).toBe(false);
        // Set an attribute in an N:M relation to the same name of other
        graph.relations.at(0).attributes.at(1).name = graph.relations.at(0).attributes.at(0).name
        expect(repeatedAttributesInEntity(graph)).toBe(true);
        expect(validateGraph(graph).noRepeatedAttrNames).toBe(false)
    })
})

describe("Every entity should have at least one attribute", () => {
    test("entities must have at least one attribute", () => {
        // Ensure the graph is valid initially
        expect(entitiesWithoutAttributes(graph)).toBe(false);
        // Remove attributes from an entity
        graph.entities.at(0).attributes = [];
        expect(entitiesWithoutAttributes(graph)).toBe(true);
        expect(validateGraph(graph).noEntitiesWithoutAttributes).toBe(false)
    });
});

describe("Relations", () => {
    test("Every relation should connect two entities (can be the same at both sides)", () => {
        // Ensure the graph is valid initially
        expect(relationsUnconnected(graph)).toBe(false);

        const initializedSide = { 
            cardinality: "",
            cell: "",
            entity: {
                idMx: "",
            },
            idMx: "",
        }
        // Remove attributes from an entity
        graph.relations.at(1).side1 = initializedSide;
        graph.relations.at(1).side2 = initializedSide;
        expect(relationsUnconnected(graph)).toBe(true);
        expect(validateGraph(graph).noUnconnectedRelations).toBe(false)
    });

    test("Cant be relations with attributes if they are not N:M", () => {
        // Ensure the graph is valid initially
         expect(notNMRelationsWithAttributes(graph)).toBe(false);

        const attributes = [
            {
                "idMx":"9",
                "name":"Atributo",
                "position":{
                    "x":560,
                    "y":130
                },
                "cell":[
                    "9",
                    "10"
                ]
            },
        ]
        // Remove attributes from an entity
        graph.relations.at(1).attributes = attributes
        expect(notNMRelationsWithAttributes(graph)).toBe(true);
    });

    test("Every relation should have valid cardinalities", () => {
        // Ensure the graph is valid initially
        expect(cardinalitiesNotValid(graph)).toBe(false);

        const initializedSide1 = { 
            cardinality: "",
            cell: "20",
            entity: {
                idMx: "",
            },
            idMx: "",
        }
        const initializedSide2 = { 
            cardinality: "",
            cell: "24",
            entity: {
                idMx: "",
            },
            idMx: "",
        }
        // Remove attributes from an entity
        graph.relations.at(1).side1 = initializedSide1;
        graph.relations.at(1).side2 = initializedSide2;
        expect(cardinalitiesNotValid(graph)).toBe(true);
        expect(validateGraph(graph).noNotValidCardinalities).toBe(false)
    });
});

describe("Invalid relation names", () => {
    test("Relations should not have empty or invalid names", () => {
        // The initial graph should be valid
        expect(invalidRelationNames(graph)).toBe(false);

        // Empty name
        graph.relations[0].name = "";
        expect(invalidRelationNames(graph)).toBe(true);
        expect(validateGraph(graph).noInvalidRelationNames).toBe(false);

        // Restore
        graph.relations[0].name = "ValidRelation";

        // Name with invalid characters:
        graph.relations[0].name = "relación@123";
        expect(invalidRelationNames(graph)).toBe(true);
        expect(validateGraph(graph).noInvalidRelationNames).toBe(false);
    });
});

describe('Weak entity validations', () => {

    beforeEach(() => {
        const data = readFileSync(resolve(__dirname, './graphs/weakEntity.json'), 'utf-8');
        graph = JSON.parse(data);
    });

    test('Weak entities must not have a primary key', () => {
        expect(weakEntityHasPrimaryKey(graph)).toBe(false)
        graph.entities.find(e => e.isWeak).attributes[0].key = true
        expect(weakEntityHasPrimaryKey(graph)).toBe(true)
        expect(validateGraph(graph).noWeakEntityWithPrimaryKey).toBe(false)
    });

    test('Weak entities must be connected to exactly one relation', () => {
        expect(weakEntityInvalidRelationCount(graph)).toBe(false);
        const weakEntity = graph.entities.find(e => e.isWeak);
        const originalRelation = graph.relations.find(
        r => r.side1.entity.idMx === weakEntity.idMx || r.side2.entity.idMx === weakEntity.idMx
        );
        const duplicatedRelation = JSON.parse(JSON.stringify(originalRelation));
        duplicatedRelation.idMx = 'duplicated';
        graph.relations.push(duplicatedRelation);
        expect(weakEntityInvalidRelationCount(graph)).toBe(true);
        expect(validateGraph(graph).noWeakEntityInvalidRelationCount).toBe(false);
    });

    test('Weak entity must have valid cardinality (0:N or 1:N and 1:1)', () => {
        expect(weakEntityWrongCardinality(graph)).toBe(false);
        const relation = graph.relations.find(r => r.isIdentifying);
        if (relation.side1.entity.idMx === graph.entities.find(e => e.isWeak).idMx) {
        relation.side1.cardinality = '1:1';
        } else {
        relation.side2.cardinality = '1:1';
        }
        expect(weakEntityWrongCardinality(graph)).toBe(true);
        expect(validateGraph(graph).noWeakEntityWrongCardinality).toBe(false);
    });

    test('Weak entities must have a discriminant attribute', () => {
        expect(weakEntityNoDiscriminant(graph)).toBe(false);
        const weakEntity = graph.entities.find(e => e.isWeak);
        weakEntity.attributes.forEach(attr => attr.discriminant = false);
        expect(weakEntityNoDiscriminant(graph)).toBe(true);
        expect(validateGraph(graph).noWeakEntityNoDiscriminant).toBe(false);
    });

    test('Weak entities must be connected to an identifying relation', () => {
        expect(weakEntityConnectedToNonIdentifyingRelation(graph)).toBe(false);
        const relation = graph.relations.find(r => r.isIdentifying);
        relation.isIdentifying = false;
        expect(weakEntityConnectedToNonIdentifyingRelation(graph)).toBe(true);
        expect(validateGraph(graph).noWeakEntityConnectedToNonIdentifyingRelation).toBe(false);
    });

    test('Weak entities must not be connected to another weak entity in identifying relation', () => {
        expect(weakEntityRelationNotConnectedToStrong(graph)).toBe(false);
        const strongEntity = graph.entities.find(e => !e.isWeak);
        strongEntity.isWeak = true;
        expect(weakEntityRelationNotConnectedToStrong(graph)).toBe(true);
        expect(validateGraph(graph).noWeakEntityRelationNotConnectedToStrong).toBe(false);
    });

});