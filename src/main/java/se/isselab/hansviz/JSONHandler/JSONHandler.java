/*
Copyright 2024 David Stechow & Philipp Kusmierz

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package se.isselab.hansviz.JSONHandler;

import com.intellij.openapi.project.Project;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import org.cef.callback.CefQueryCallback;
import se.isselab.HAnS.featureExtension.HAnSCallback;
import se.isselab.HAnS.featureExtension.FeatureService;
import se.isselab.HAnS.featureLocation.FeatureFileMapping;
import se.isselab.HAnS.featureLocation.FeatureLocation;
import se.isselab.HAnS.featureModel.psi.FeatureModelFeature;
import se.isselab.HAnS.metrics.FeatureMetrics;
import se.isselab.hansviz.JSONHandler.pathFormatter.PathFormatter;


import java.util.HashMap;
import java.util.HashSet;
import java.util.List;


//TODO THESIS use featureService functions for the class

public class JSONHandler implements HAnSCallback {
    private final CefQueryCallback callback;
    private final JSONType jsonType;
    private final Project project;

    private final FeatureService featureService;

    @Override
    public void onComplete(FeatureMetrics featureMetrics) {
        JSONObject dataJSON = new JSONObject();
        JSONArray nodesJSON = new JSONArray();
        JSONArray linksJSON = new JSONArray();
        HashMap<String, FeatureFileMapping> featureFileMappings = featureMetrics.getFeatureFileMappings();
        HashMap<FeatureModelFeature, HashSet<FeatureModelFeature>> tanglingMap = featureMetrics.getTanglingMap();

        HashMap<FeatureModelFeature, Integer> featureToId = new HashMap<>();
        int counter = 0;
        List<FeatureModelFeature> topLevelFeatures = null;

        if(jsonType == JSONType.Default || jsonType == JSONType.Tree || jsonType == JSONType.TreeMap)
            topLevelFeatures = featureService.getRootFeatures();
        // &begin[Tangling]
        else if(jsonType == JSONType.Tangling)
            topLevelFeatures = featureService.getFeatures();
        // &end[Tangling]
        else {
            //return new JSONObject();
        }


        for(var feature : topLevelFeatures) {
            JSONObject featureObj = featureToJSON(feature, featureFileMappings, tanglingMap);
            nodesJSON.add(featureObj);
            featureToId.put(feature, counter);
            counter++;
        }


        for(var featureToTangledFeatures : tanglingMap.entrySet()){
            for(var tangledFeature : featureToTangledFeatures.getValue()){
                //add link if id of feature is less than the id of the tangled one
                if(!featureToId.containsKey(featureToTangledFeatures.getKey()) || !featureToId.containsKey(tangledFeature))
                    continue;
                if(featureToId.get(featureToTangledFeatures.getKey()) < featureToId.get(tangledFeature))
                {
                    JSONObject obj = new JSONObject();
                    obj.put("source", featureToTangledFeatures.getKey().getLPQText());
                    obj.put("target", tangledFeature.getLPQText());
                    linksJSON.add(obj);
                }
            }
        }
        dataJSON.put("features", nodesJSON);
        dataJSON.put("tanglingLinks", linksJSON);
        callback.success(dataJSON.toJSONString());
    }

    public enum JSONType {Default, Tree, TreeMap, Tangling}

    public JSONHandler(Project project, JSONType type, CefQueryCallback callback) {
        this.project = project;
        this.jsonType = type;
        this.callback = callback;
        featureService = project.getService(FeatureService.class);
        featureService.getFeatureMetricsBackground(this);
    }
    // TODO: HAnS Annotation
    /**
     * Helperfunction to recursively create JSONObjects of features
     * Recursion takes place within the child property of the feature
     *
     * @param feature feature which should be converted to JSON
     * @return JSONObject of given feature
     */
    private JSONObject featureToJSON(FeatureModelFeature feature, HashMap<String, FeatureFileMapping> featureFileMappings, HashMap<FeatureModelFeature, HashSet<FeatureModelFeature>> tanglingMap){
        JSONObject obj = new JSONObject();
        obj.put("id", feature.getLPQText());
        obj.put("name", feature.getFeatureName());
        var tangledFeatureMap = featureService.getTanglingMapOfFeature(tanglingMap, feature);
        int tanglingDegree = tangledFeatureMap != null ? tangledFeatureMap.size() : 0;
        FeatureFileMapping featureFileMapping = featureService.getFeatureFileMappingOfFeature(featureFileMappings, feature);
        List<FeatureModelFeature> childFeatureList = featureService.getChildFeatures(feature);

        //recursively get all child features
        JSONArray childArr = new JSONArray();
        for(var child : childFeatureList){
            childArr.add(featureToJSON(child, featureFileMappings, tanglingMap));
        }

        obj.put("children", childArr);
        obj.put("tanglingDegree", tanglingDegree);
        obj.put("scatteringDegree", featureService.getFeatureScattering(featureFileMapping));
/*
        obj.put("lines", featureFileMappings.get(feature.getLPQText()).getTotalFeatureLineCount());
*/
        obj.put("lines", featureService.getTotalFeatureLineCount(featureFileMapping));
        obj.put("totalLines", getTotalLineCountWithChilds(feature, featureFileMappings));

        //put locations and their line count into array
        JSONArray locations = new JSONArray();
        var featureLocations = featureService.getFeatureLocations(featureFileMapping);
        for(FeatureLocation featureLocation : featureLocations){
            JSONArray blocks = new JSONArray();
            for(var block : featureService.getListOfFeatureLocationBlock(featureLocation)){
                JSONObject blockObj = new JSONObject();
                blockObj.put("start", block.getStartLine());
                blockObj.put("end", block.getEndLine());
                blockObj.put("type", featureLocation.getAnnotationType().toString());
                blocks.add(blockObj);
            }
            //get the linecount of a feature for each file and add it
            JSONObject locationObj = new JSONObject();
            if(featureService.isFeatureInFeatureFileMappings(featureFileMappings,feature)){
                locationObj.put("lines", featureService.getFeatureLineCountInFile(featureFileMapping, featureLocation));
            }
            else{
                locationObj.put("lines", 0);
            }
            locationObj.put("blocks", blocks);
            locationObj.put("path", PathFormatter.shortenPathToSource(project,featureLocation.getMappedPath()));
            locationObj.put("fileName", PathFormatter.shortenPathToFile(featureLocation.getMappedPath()));
            locations.add(locationObj);
        }
        obj.put("locations", locations);
        return obj;
    }

    private JSONArray getChildFeaturesAsJson(FeatureModelFeature parentFeature, HashMap<String, FeatureFileMapping> fileMapping) {
        JSONArray children = new JSONArray();
        var childFeatureList = featureService.getChildFeatures(parentFeature);

        //iterate over each child and recursively get its childs
        for(var child : childFeatureList){
            //get linecount of feature via mapping

            JSONObject childJson = new JSONObject();
            childJson.put("name", child.getLPQText());
            childJson.put("value", getTotalLineCountWithChilds(child,fileMapping));
            childJson.put("children", getChildFeaturesAsJson(child, fileMapping));
            children.add(childJson);
        }
        return children;
    }


    private int getTotalLineCountWithChilds(FeatureModelFeature parent, HashMap<String, FeatureFileMapping> fileMapping){
        int total = 0;
        FeatureFileMapping parentFileMapping = featureService.getFeatureFileMappingOfFeature(fileMapping, parent);
        for(var child : featureService.getChildFeatures(parent)){
            total += getTotalLineCountWithChilds(child, fileMapping);
        }
        if(fileMapping.containsKey(parent.getLPQText()))
            total += featureService.getTotalFeatureLineCount(parentFileMapping);
        return total;
    }
}
