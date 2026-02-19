import {createFeatureHub} from '@feature-hub/core';
import {learningProgressServiceDefinition} from '../feature-services/learningProgress';

export const featureHub = createFeatureHub('edu:integrator', {
  featureServiceDefinitions: [learningProgressServiceDefinition],
  featureServiceDependencies: {
    [learningProgressServiceDefinition.id]: '^1.0.0',
  },
});

