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

package se.isselab.hansviz.JSONHandler.pathFormatter;

import com.intellij.openapi.project.Project;

public class PathFormatter {
    public static String shortenPathToSource(Project project, String path){
        if(project.getBasePath()==null) return path;
        String newPath = path.replaceFirst(project.getBasePath(),"");
        return newPath;
    }
    public static String shortenPathToFileInFolder(String path){
        // TODO "\\"
        String divider;
        if(path.contains("/")) divider ="/";
        else if (path.contains("\"")) divider = "\"";
        else return path;

        String [] tokens = path.split(divider);
        if(tokens.length==1) return tokens[0];
        String newPath = divider + tokens[tokens.length-2] + divider + tokens[tokens.length-1];
        return newPath;
    }
    public static String shortenPathToFile(String path){
        String divider;
        if(path.contains("/")) divider ="/";
        else if (path.contains("\"")) divider = "\"";
        else return path;

        String [] tokens = path.split("/");
        String file = tokens[tokens.length - 1];
        return file;
    }
}
