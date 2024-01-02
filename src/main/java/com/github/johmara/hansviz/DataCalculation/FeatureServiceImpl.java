package com.github.johmara.hansviz.DataCalculation;

import se.isselab.HAnS.featureExtension.FeatureServiceInterface;
import se.isselab.HAnS.featureLocation.FeatureFileMapping;
import se.isselab.HAnS.featureModel.psi.FeatureModelFeature;

import java.util.List;

public class FeatureServiceImpl implements FeatureServiceInterface {
    @Override
    public List<FeatureModelFeature> getFeatures() {
        return null;
    }

    @Override
    public FeatureFileMapping getFeatureFileMapping(FeatureModelFeature featureModelFeature) {
        return null;
    }

    @Override
    public int getFeatureTangling(FeatureModelFeature featureModelFeature) {
        return 0;
    }

    @Override
    public int getFeatureScattering(FeatureModelFeature featureModelFeature) {
        return 0;
    }

    @Override
    public List<FeatureModelFeature> getChildFeatures(FeatureModelFeature featureModelFeature) {
        return null;
    }

    @Override
    public FeatureModelFeature getParentFeature(FeatureModelFeature featureModelFeature) {
        return null;
    }

    @Override
    public FeatureModelFeature getRootFeature(FeatureModelFeature featureModelFeature) {
        return null;
    }

    @Override
    public void createFeature(FeatureModelFeature featureModelFeature) {

    }

    @Override
    public FeatureModelFeature renameFeature(FeatureModelFeature featureModelFeature) {
        return null;
    }

    @Override
    public boolean deleteFeature(FeatureModelFeature featureModelFeature) {
        return false;
    }
}
